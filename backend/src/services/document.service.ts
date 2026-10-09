import { prisma } from "../config/db";
import { AppError } from "../utils/api-error";
import { OcrService, ExtractedDataPayload } from "./ocr.service";

export class DocumentService {
  static async uploadAndProcess(params: {
    patientId: string;
    uploadedById: string;
    title: string;
    documentType: any;
    fileName: string;
    mimeType: string;
    fileSize?: number;
    fileData?: string; // base64 or URL
    documentDate?: string;
    customOcrText?: string;
  }) {
    const {
      patientId,
      uploadedById,
      title,
      documentType,
      fileName,
      mimeType,
      fileSize,
      fileData,
      documentDate,
      customOcrText,
    } = params;

    // Verify patient exists
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw AppError.notFound("Patient record not found.");

    // Run modular OCR & AI extraction
    const extractedPayload: ExtractedDataPayload = await OcrService.processDocument({
      fileName,
      mimeType,
      documentType: documentType || "OTHER",
      fileBase64: fileData,
      customText: customOcrText,
    });

    const status =
      extractedPayload.flaggedForReviewCount > 0 ? "NEEDS_REVIEW" : "PROCESSED";

    const documentDateParsed = documentDate ? new Date(documentDate) : new Date();

    const fileUrl = fileData
      ? fileData.startsWith("data:")
        ? fileData
        : `data:${mimeType};base64,${fileData}`
      : `https://mediflow-storage.local/documents/${Date.now()}_${fileName}`;

    const document = await prisma.medicalDocument.create({
      data: {
        patientId,
        uploadedById,
        title: title || fileName,
        documentType: documentType || "OTHER",
        fileName,
        fileUrl,
        mimeType: mimeType || "application/pdf",
        fileSize: fileSize || 1024,
        documentDate: documentDateParsed,
        status: status as any,
        extractedData: extractedPayload as any,
        summary: extractedPayload.aiSummary,
        disclaimer: extractedPayload.disclaimer,
        isVerified: false,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, uhid: true } },
        uploadedBy: { select: { id: true, email: true, role: true } },
      },
    });

    return document;
  }

  static async getByPatientId(patientId: string) {
    const documents = await prisma.medicalDocument.findMany({
      where: { patientId },
      orderBy: { documentDate: "desc" },
      include: {
        uploadedBy: { select: { id: true, email: true, role: true } },
        verifiedBy: { select: { id: true, email: true } },
      },
    });

    // Compute Timeline and Aggregated Clinical Summary
    const timeline = documents.map((doc) => {
      const extracted = doc.extractedData as any;
      return {
        id: doc.id,
        date: doc.documentDate || doc.createdAt,
        title: doc.title,
        documentType: doc.documentType,
        status: doc.status,
        isVerified: doc.isVerified,
        summary: doc.summary,
        diagnosesCount: extracted?.diseases?.length || 0,
        medicinesCount: extracted?.medicines?.length || 0,
        abnormalLabsCount:
          extracted?.labResults?.filter(
            (l: any) => l.status === "ABNORMAL" || l.status === "CRITICAL"
          )?.length || 0,
      };
    });

    // Consolidate Active Clinical Intelligence
    const allDiseases: any[] = [];
    const allMedicines: any[] = [];
    const allAllergies: any[] = [];
    const allLabResults: any[] = [];

    documents.forEach((doc) => {
      const data = doc.extractedData as any;
      if (data?.diseases) allDiseases.push(...data.diseases);
      if (data?.medicines) allMedicines.push(...data.medicines);
      if (data?.allergies) allAllergies.push(...data.allergies);
      if (data?.labResults) allLabResults.push(...data.labResults);
    });

    return {
      documents,
      timeline,
      aggregatedSummary: {
        totalDocuments: documents.length,
        verifiedCount: documents.filter((d) => d.isVerified).length,
        needsReviewCount: documents.filter((d) => d.status === "NEEDS_REVIEW").length,
        diseases: allDiseases,
        medicines: allMedicines,
        allergies: allAllergies,
        labResults: allLabResults,
      },
    };
  }

  static async getById(id: string) {
    const document = await prisma.medicalDocument.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, uhid: true, gender: true, dateOfBirth: true } },
        uploadedBy: { select: { id: true, email: true, role: true } },
        verifiedBy: { select: { id: true, email: true } },
      },
    });

    if (!document) throw AppError.notFound("Medical document record not found.");
    return document;
  }

  static async patientConfirm(id: string, updatedExtractedData: any, patientNotes?: string) {
    const doc = await this.getById(id);

    const updatedDocument = await prisma.medicalDocument.update({
      where: { id },
      data: {
        extractedData: updatedExtractedData as any,
        patientNotes: patientNotes || doc.patientNotes,
        status: "VERIFIED_BY_PATIENT" as any,
      },
      include: {
        patient: true,
        uploadedBy: true,
      },
    });

    return updatedDocument;
  }

  static async doctorVerify(
    id: string,
    doctorId: string,
    updatedExtractedData: any,
    doctorNotes?: string
  ) {
    await this.getById(id);

    const updatedDocument = await prisma.medicalDocument.update({
      where: { id },
      data: {
        extractedData: updatedExtractedData as any,
        doctorNotes,
        isVerified: true,
        verifiedById: doctorId,
        verifiedAt: new Date(),
        status: "DOCTOR_VERIFIED" as any,
      },
      include: {
        patient: true,
        uploadedBy: true,
        verifiedBy: true,
      },
    });

    return updatedDocument;
  }

  static async delete(id: string) {
    await this.getById(id);
    await prisma.medicalDocument.delete({ where: { id } });
    return { success: true, message: "Document deleted successfully." };
  }
}

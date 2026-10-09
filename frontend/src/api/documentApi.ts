import { apiClient } from "./client";
import { ApiResponse } from "../types/api";

export interface MedicalDocumentRecord {
  id: string;
  patientId: string;
  uploadedById: string;
  documentType: "PRESCRIPTION" | "LAB_REPORT" | "DISCHARGE_SUMMARY" | "MEDICAL_REPORT" | "OTHER";
  title: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize?: number;
  documentDate?: string;
  status:
    | "PENDING"
    | "PROCESSING"
    | "PROCESSED"
    | "NEEDS_REVIEW"
    | "VERIFIED_BY_PATIENT"
    | "DOCTOR_VERIFIED"
    | "FAILED";
  extractedData?: {
    rawText: string;
    ocrEngine: string;
    diseases: Array<{ name: string; category?: string; confidence: number; needsReview: boolean }>;
    medicines: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration?: string;
      confidence: number;
      needsReview: boolean;
    }>;
    allergies: Array<{
      allergen: string;
      reaction?: string;
      confidence: number;
      needsReview: boolean;
    }>;
    labResults: Array<{
      testName: string;
      resultValue: string;
      unit?: string;
      referenceRange?: string;
      status: "NORMAL" | "ABNORMAL" | "CRITICAL" | "UNCERTAIN";
      confidence: number;
      needsReview: boolean;
    }>;
    procedures: Array<{
      name: string;
      date?: string;
      notes?: string;
      confidence: number;
      needsReview: boolean;
    }>;
    keyDates: Array<{ event: string; date: string }>;
    overallConfidence: number;
    flaggedForReviewCount: number;
    aiSummary: string;
    disclaimer: string;
  };
  summary?: string;
  disclaimer?: string;
  isVerified: boolean;
  verifiedById?: string;
  verifiedAt?: string;
  patientNotes?: string;
  doctorNotes?: string;
  createdAt: string;
  updatedAt: string;
  patient?: { id: string; firstName: string; lastName: string; uhid: string };
  uploadedBy?: { id: string; email: string; role?: any };
  verifiedBy?: { id: string; email: string };
}

export interface PatientDocumentIntelligencePayload {
  documents: MedicalDocumentRecord[];
  timeline: Array<{
    id: string;
    date: string;
    title: string;
    documentType: string;
    status: string;
    isVerified: boolean;
    summary?: string;
    diagnosesCount: number;
    medicinesCount: number;
    abnormalLabsCount: number;
  }>;
  aggregatedSummary: {
    totalDocuments: number;
    verifiedCount: number;
    needsReviewCount: number;
    diseases: any[];
    medicines: any[];
    allergies: any[];
    labResults: any[];
  };
}

export const documentApi = {
  uploadDocument: async (payload: {
    patientId: string;
    title?: string;
    documentType: string;
    fileName: string;
    mimeType: string;
    fileSize?: number;
    fileData?: string; // base64 or URL
    documentDate?: string;
    customOcrText?: string;
  }) => {
    const { data } = await apiClient.post<ApiResponse<MedicalDocumentRecord>>(
      "/documents/upload",
      payload
    );
    return data.data;
  },

  getByPatient: async (patientId: string) => {
    const { data } = await apiClient.get<ApiResponse<PatientDocumentIntelligencePayload>>(
      `/documents/patient/${patientId}`
    );
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<MedicalDocumentRecord>>(`/documents/${id}`);
    return data.data;
  },

  patientConfirm: async (
    id: string,
    payload: { extractedData: any; patientNotes?: string }
  ) => {
    const { data } = await apiClient.patch<ApiResponse<MedicalDocumentRecord>>(
      `/documents/${id}/patient-confirm`,
      payload
    );
    return data.data;
  },

  doctorVerify: async (
    id: string,
    payload: { extractedData: any; doctorNotes?: string }
  ) => {
    const { data } = await apiClient.patch<ApiResponse<MedicalDocumentRecord>>(
      `/documents/${id}/doctor-verify`,
      payload
    );
    return data.data;
  },

  deleteDocument: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      `/documents/${id}`
    );
    return data.data;
  },
};

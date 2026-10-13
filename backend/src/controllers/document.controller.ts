import { Request, Response, NextFunction } from "express";
import { DocumentService } from "../services/document.service";
import { AppError } from "../utils/api-error";

export class DocumentController {
  static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        patientId,
        title,
        documentType,
        fileName,
        mimeType,
        fileSize,
        fileData,
        documentDate,
        customOcrText,
      } = req.body;

      if (!patientId || !fileName) {
        throw AppError.badRequest("patientId and fileName are required.");
      }

      const uploadedById = (req as any).user?.id || req.body.uploadedById;
      if (!uploadedById) throw AppError.unauthorized("User authentication required.");

      const document = await DocumentService.uploadAndProcess({
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
      });

      res.status(201).json({
        success: true,
        message: "Medical document uploaded and processed successfully.",
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getByPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = String(req.params.patientId);
      if (!patientId) throw AppError.badRequest("patientId parameter is required.");

      const data = await DocumentService.getByPatientId(patientId);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const document = await DocumentService.getById(id);

      res.status(200).json({
        success: true,
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  static async patientConfirm(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { extractedData, patientNotes } = req.body;

      const document = await DocumentService.patientConfirm(id, extractedData, patientNotes);

      res.status(200).json({
        success: true,
        message: "Extracted medical information confirmed by patient.",
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  static async doctorVerify(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { extractedData, doctorNotes } = req.body;
      const doctorId = String((req as any).user?.id || req.body.doctorId || "");

      const document = await DocumentService.doctorVerify(
        id,
        doctorId,
        extractedData,
        doctorNotes
      );

      res.status(200).json({
        success: true,
        message: "Medical document summary verified and locked by doctor.",
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await DocumentService.delete(id);

      res.status(200).json({
        success: true,
        message: "Medical document deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
}

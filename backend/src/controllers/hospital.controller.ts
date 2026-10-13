import { Request, Response, NextFunction } from "express";
import { HospitalService } from "../services/hospital.service";
import { HospitalImportService } from "../services/hospital-import.service";
import { AppError } from "../utils/api-error";

const toCreateInput = (body: any) => ({
  name: body.name,
  code: body.code,
  type: body.type,
  speciality: body.speciality,
  address: body.address,
  latitude: body.latitude,
  longitude: body.longitude,
  mapConfig: body.mapConfig,
  contactEmail: body.contactEmail,
  contactPhone: body.contactPhone,
  isVerified: body.isVerified !== undefined ? Boolean(body.isVerified) : false,
  city: { connect: { id: body.cityId } },
});

const toUpdateInput = (body: any) => {
  const data: any = { ...body };
  delete data.cityId;
  if (body.cityId) data.city = { connect: { id: body.cityId } };
  return data;
};

export class HospitalController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const hospital = await HospitalService.create(toCreateInput(req.body));
      res.status(201).json({
        success: true,
        message: "Hospital created successfully.",
        data: hospital,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.max(1, Number(req.query.limit) || 10);
      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const stateId = typeof req.query.stateId === "string" ? req.query.stateId : undefined;
      const cityId = typeof req.query.cityId === "string" ? req.query.cityId : undefined;
      const type = typeof req.query.type === "string" ? (req.query.type as any) : undefined;
      const speciality = typeof req.query.speciality === "string" ? (req.query.speciality as any) : undefined;
      const status = typeof req.query.status === "string" ? (req.query.status as any) : undefined;
      const isVerified =
        req.query.isVerified === "true"
          ? true
          : req.query.isVerified === "false"
          ? false
          : undefined;

      const result = await HospitalService.list({
        page,
        limit,
        search,
        stateId,
        cityId,
        type,
        speciality,
        status,
        isVerified,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const hospital = await HospitalService.getById(String(req.params.id));
      res.status(200).json({ success: true, data: hospital });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const hospital = await HospitalService.update(
        String(req.params.id),
        toUpdateInput(req.body)
      );
      res.status(200).json({
        success: true,
        message: "Hospital updated successfully.",
        data: hospital,
      });
    } catch (error) {
      next(error);
    }
  }

  static async setStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const hospital = await HospitalService.setStatus(
        String(req.params.id),
        req.body.status
      );
      res.status(200).json({
        success: true,
        message: "Hospital status updated.",
        data: hospital,
      });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await HospitalService.remove(String(req.params.id));
      res.status(200).json({
        success: true,
        message: "Hospital deactivated successfully.",
      });
    } catch (error) {
      next(error);
    }
  }

  static async importCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const csvContent =
        typeof req.body?.csvContent === "string"
          ? req.body.csvContent
          : typeof req.body === "string"
          ? req.body
          : "";

      if (!csvContent || csvContent.trim().length === 0) {
        throw AppError.badRequest("csvContent string is required.");
      }

      const result = await HospitalImportService.importFromCsvContent(csvContent);
      res.status(200).json({
        success: true,
        message: `Processed ${result.total} records: ${result.imported} imported, ${result.updated} updated.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

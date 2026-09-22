import { Request, Response, NextFunction } from "express";
import { DoctorService } from "../services/doctor.service";

export class DoctorController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorService.create(req.body);
      res.status(201).json({
        success: true,
        message: "Doctor created successfully.",
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.max(1, Number(req.query.limit) || 10);
      const hospitalId = typeof req.query.hospitalId === "string" ? req.query.hospitalId : undefined;
      const departmentId = typeof req.query.departmentId === "string" ? req.query.departmentId : undefined;
      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const available = typeof req.query.available === "string" ? (req.query.available as any) : undefined;

      const result = await DoctorService.list({
        page,
        limit,
        hospitalId,
        departmentId,
        search,
        available,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorService.getById(String(req.params.id));
      res.status(200).json({ success: true, data: doctor });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorService.update(String(req.params.id), req.body);
      res.status(200).json({
        success: true,
        message: "Doctor updated successfully.",
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  static async availability(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorService.setAvailability(
        String(req.params.id),
        req.body.isAvailable
      );
      res.status(200).json({
        success: true,
        message: "Doctor availability updated.",
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from "express";
import { StaffService } from "../services/staff.service";

export class StaffController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = await StaffService.create(req.body);
      res.status(201).json({
        success: true,
        message: "Staff member provisioned successfully.",
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const hospitalId = req.query.hospitalId ? String(req.query.hospitalId) : undefined;
      const type = req.query.type ? (req.query.type as any) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;

      const result = await StaffService.list({ page, limit, hospitalId, type, search });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = await StaffService.getById(String(req.params.id));
      res.status(200).json({ success: true, data: staff });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = await StaffService.update(String(req.params.id), req.body);
      res.status(200).json({
        success: true,
        message: "Staff profile updated successfully.",
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  }
}

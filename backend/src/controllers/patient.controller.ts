import { Request, Response, NextFunction } from "express";
import { PatientService } from "../services/patient.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class PatientController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 10);

      const search =
        typeof req.query.search === "string"
          ? req.query.search
          : undefined;

      const hospitalId =
        typeof req.query.hospitalId === "string"
          ? req.query.hospitalId
          : undefined;

      const result = await PatientService.list({
        page,
        limit,
        search,
        hospitalId,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const patient = await PatientService.getById(
        String(req.params.id)
      );

      res.status(200).json({
        success: true,
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as AuthenticatedRequest).user!.userId;

      const patient = await PatientService.getMyProfile(userId);

      res.status(200).json({
        success: true,
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const patient = await PatientService.update(
        String(req.params.id),
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Patient profile updated successfully.",
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  static async appointments(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const appointments = await PatientService.getAppointments(
        String(req.params.id)
      );

      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  static async queue(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const queue = await PatientService.getQueue(
        String(req.params.id)
      );

      res.status(200).json({
        success: true,
        data: queue,
      });
    } catch (error) {
      next(error);
    }
  }
}
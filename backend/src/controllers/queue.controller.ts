import { Request, Response, NextFunction } from "express";
import { QueueService } from "../services/queue.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class QueueController {
  static async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const queue = await QueueService.checkIn(
        req.body.appointmentId,
        req.body.priorityLevel
      );
      res.status(201).json({
        success: true,
        message: "Patient checked into queue successfully.",
        data: queue,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await QueueService.list(req.query as any);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const queue = await QueueService.getById(String(req.params.id));
      res.status(200).json({ success: true, data: queue });
    } catch (error) {
      next(error);
    }
  }

  static async callNext(req: Request, res: Response, next: NextFunction) {
    try {
      const queue = await QueueService.callNext(
        String(req.params.id),
        req.body.roomId,
        req.body.counterId
      );
      res.status(200).json({
        success: true,
        message: "Next patient called successfully.",
        data: queue,
      });
    } catch (error) {
      next(error);
    }
  }

  static async setStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const queue = await QueueService.setStatus(
        String(req.params.id),
        req.body.status
      );
      res.status(200).json({
        success: true,
        message: "Queue status updated.",
        data: queue,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePriority(req: Request, res: Response, next: NextFunction) {
    try {
      const queue = await QueueService.updatePriority(
        String(req.params.id),
        req.body.priorityLevel
      );
      res.status(200).json({
        success: true,
        message: "Queue priority updated.",
        data: queue,
      });
    } catch (error) {
      next(error);
    }
  }

  static async myPosition(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthenticatedRequest).user!;
      const position = await QueueService.getPatientPositionFromUser(user.userId);
      res.status(200).json({ success: true, data: position });
    } catch (error) {
      next(error);
    }
  }
}

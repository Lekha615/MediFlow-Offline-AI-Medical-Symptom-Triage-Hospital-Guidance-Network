import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";

export class LocationController {
  static async getStates(req: Request, res: Response, next: NextFunction) {
    try {
      const states = await prisma.state.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { cities: true },
          },
        },
      });
      res.status(200).json({ success: true, data: states });
    } catch (error) {
      next(error);
    }
  }

  static async getCities(req: Request, res: Response, next: NextFunction) {
    try {
      const stateId = typeof req.query.stateId === "string" ? req.query.stateId : undefined;
      const cities = await prisma.city.findMany({
        where: stateId ? { stateId } : undefined,
        include: {
          state: true,
          _count: {
            select: { hospitals: true },
          },
        },
        orderBy: { name: "asc" },
      });
      res.status(200).json({ success: true, data: cities });
    } catch (error) {
      next(error);
    }
  }
}

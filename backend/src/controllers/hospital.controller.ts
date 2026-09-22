import { Request, Response, NextFunction } from "express";
import { HospitalService } from "../services/hospital.service";

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
      const cityId = typeof req.query.cityId === "string" ? req.query.cityId : undefined;
      const type = typeof req.query.type === "string" ? (req.query.type as any) : undefined;
      const speciality = typeof req.query.speciality === "string" ? (req.query.speciality as any) : undefined;
      const status = typeof req.query.status === "string" ? (req.query.status as any) : undefined;

      const result = await HospitalService.list({
        page,
        limit,
        search,
        cityId,
        type,
        speciality,
        status,
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
}

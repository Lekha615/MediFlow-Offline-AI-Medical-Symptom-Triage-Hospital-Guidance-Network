import { Router } from "express";
import { HospitalController } from "../controllers/hospital.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { ROLES } from "../config/auth.config";
import {
  hospitalCreateSchema,
  hospitalUpdateSchema,
  hospitalListSchema,
  idParamSchema,
} from "../validators/hospital.validator";
import { z } from "zod";

const router = Router();

const adminRoles = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN] as const;

router.get(
  "/",
  validate(hospitalListSchema, "query"),
  HospitalController.list
);

router.get(
  "/:id",
  validate(idParamSchema, "params"),
  HospitalController.getById
);

router.post(
  "/",
  authenticate,
  authorize(...adminRoles),
  validate(hospitalCreateSchema),
  HospitalController.create
);

router.patch(
  "/:id",
  authenticate,
  authorize(...adminRoles),
  validate(idParamSchema, "params"),
  validate(hospitalUpdateSchema),
  HospitalController.update
);

router.patch(
  "/:id/status",
  authenticate,
  authorize(...adminRoles),
  validate(idParamSchema, "params"),
  validate(z.object({ status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]) })),
  HospitalController.setStatus
);

router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  validate(idParamSchema, "params"),
  HospitalController.remove
);

export default router;

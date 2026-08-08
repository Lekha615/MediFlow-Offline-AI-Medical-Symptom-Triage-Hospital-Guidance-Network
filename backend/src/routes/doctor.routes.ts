import { Router } from "express";
import { DoctorController } from "../controllers/doctor.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { ROLES } from "../config/auth.config";
import {
  doctorCreateSchema,
  doctorUpdateSchema,
  doctorListSchema,
  doctorIdSchema,
} from "../validators/doctor.validator";
import { z } from "zod";

const router = Router();
const adminRoles = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN] as const;

router.get("/", validate(doctorListSchema, "query"), DoctorController.list);
router.get(
  "/:id",
  validate(doctorIdSchema, "params"),
  DoctorController.getById
);

router.post(
  "/",
  authenticate,
  authorize(...adminRoles),
  validate(doctorCreateSchema),
  DoctorController.create
);

router.patch(
  "/:id",
  authenticate,
  authorize(...adminRoles),
  validate(doctorIdSchema, "params"),
  validate(doctorUpdateSchema),
  DoctorController.update
);

router.patch(
  "/:id/availability",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR),
  validate(doctorIdSchema, "params"),
  validate(z.object({ isAvailable: z.boolean() })),
  DoctorController.availability
);

export default router;

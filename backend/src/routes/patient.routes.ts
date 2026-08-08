import { Router } from "express";
import { PatientController } from "../controllers/patient.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { ROLES } from "../config/auth.config";
import {
  patientListSchema,
  patientIdSchema,
  patientUpdateSchema,
} from "../validators/patient.validator";

const router = Router();

router.get(
  "/me",
  authenticate,
  authorize(ROLES.PATIENT),
  PatientController.me
);

router.get(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.HOSPITAL_ADMIN,
    ROLES.DOCTOR,
    ROLES.RECEPTIONIST,
    ROLES.LAB_TECHNICIAN
  ),
  validate(patientListSchema, "query"),
  PatientController.list
);

router.get(
  "/:id",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.HOSPITAL_ADMIN,
    ROLES.DOCTOR,
    ROLES.RECEPTIONIST,
    ROLES.PATIENT
  ),
  validate(patientIdSchema, "params"),
  PatientController.getById
);

router.patch(
  "/:id",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.HOSPITAL_ADMIN,
    ROLES.DOCTOR,
    ROLES.PATIENT
  ),
  validate(patientIdSchema, "params"),
  validate(patientUpdateSchema),
  PatientController.update
);

router.get(
  "/:id/appointments",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.HOSPITAL_ADMIN,
    ROLES.DOCTOR,
    ROLES.RECEPTIONIST,
    ROLES.PATIENT
  ),
  validate(patientIdSchema, "params"),
  PatientController.appointments
);

router.get(
  "/:id/queue",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.HOSPITAL_ADMIN,
    ROLES.DOCTOR,
    ROLES.RECEPTIONIST,
    ROLES.PATIENT
  ),
  validate(patientIdSchema, "params"),
  PatientController.queue
);

export default router;

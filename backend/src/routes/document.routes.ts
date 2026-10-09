import { Router } from "express";
import { DocumentController } from "../controllers/document.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { ROLES } from "../config/auth.config";

const router = Router();

router.post(
  "/upload",
  authenticate,
  authorize(
    ROLES.PATIENT,
    ROLES.RECEPTIONIST,
    ROLES.DOCTOR,
    ROLES.HOSPITAL_ADMIN,
    ROLES.SUPER_ADMIN
  ),
  DocumentController.upload
);

router.get(
  "/patient/:patientId",
  authenticate,
  authorize(
    ROLES.PATIENT,
    ROLES.DOCTOR,
    ROLES.RECEPTIONIST,
    ROLES.HOSPITAL_ADMIN,
    ROLES.SUPER_ADMIN
  ),
  DocumentController.getByPatient
);

router.get(
  "/:id",
  authenticate,
  authorize(
    ROLES.PATIENT,
    ROLES.DOCTOR,
    ROLES.RECEPTIONIST,
    ROLES.HOSPITAL_ADMIN,
    ROLES.SUPER_ADMIN
  ),
  DocumentController.getById
);

router.patch(
  "/:id/patient-confirm",
  authenticate,
  authorize(ROLES.PATIENT, ROLES.DOCTOR, ROLES.SUPER_ADMIN),
  DocumentController.patientConfirm
);

router.patch(
  "/:id/doctor-verify",
  authenticate,
  authorize(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  DocumentController.doctorVerify
);

router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.PATIENT, ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  DocumentController.delete
);

export default router;

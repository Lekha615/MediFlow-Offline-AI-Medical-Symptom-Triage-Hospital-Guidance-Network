import { Router } from "express";
import { StaffController } from "../controllers/staff.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { ROLES } from "../config/auth.config";

const router = Router();
const adminRoles = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN] as const;

router.get(
  "/",
  authenticate,
  authorize(...adminRoles, ROLES.RECEPTIONIST),
  StaffController.list
);

router.get(
  "/:id",
  authenticate,
  authorize(...adminRoles, ROLES.RECEPTIONIST),
  StaffController.getById
);

router.post(
  "/",
  authenticate,
  authorize(...adminRoles),
  StaffController.create
);

router.patch(
  "/:id",
  authenticate,
  authorize(...adminRoles),
  StaffController.update
);

export default router;

import { Router } from "express";
import { QueueController } from "../controllers/queue.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { ROLES } from "../config/auth.config";
import {
  queueCreateSchema,
  queueIdSchema,
  queueListSchema,
  queueCallSchema,
  queuePrioritySchema,
} from "../validators/queue.validator";
import { z } from "zod";

const router = Router();

router.get(
  "/my-position",
  authenticate,
  authorize(ROLES.PATIENT),
  QueueController.myPosition
);

router.get(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.HOSPITAL_ADMIN,
    ROLES.DOCTOR,
    ROLES.RECEPTIONIST
  ),
  validate(queueListSchema, "query"),
  QueueController.list
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
  validate(queueIdSchema, "params"),
  QueueController.getById
);

router.post(
  "/check-in",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.HOSPITAL_ADMIN,
    ROLES.RECEPTIONIST,
    ROLES.DOCTOR
  ),
  validate(queueCreateSchema),
  QueueController.checkIn
);

router.post(
  "/:id/call-next",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.HOSPITAL_ADMIN,
    ROLES.RECEPTIONIST,
    ROLES.DOCTOR
  ),
  validate(queueIdSchema, "params"),
  validate(queueCallSchema),
  QueueController.callNext
);

router.patch(
  "/:id/status",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.HOSPITAL_ADMIN,
    ROLES.RECEPTIONIST,
    ROLES.DOCTOR
  ),
  validate(queueIdSchema, "params"),
  validate(
    z.object({
      status: z.enum([
        "CALLED",
        "IN_CONSULTATION",
        "SKIPPED",
        "RECALLED",
        "COMPLETED",
      ]),
    })
  ),
  QueueController.setStatus
);

router.patch(
  "/:id/priority",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.HOSPITAL_ADMIN,
    ROLES.RECEPTIONIST,
    ROLES.DOCTOR
  ),
  validate(queueIdSchema, "params"),
  validate(queuePrioritySchema),
  QueueController.updatePriority
);

export default router;

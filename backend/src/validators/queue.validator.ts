import { z } from "zod";

export const queueCreateSchema = z.object({
  appointmentId: z.string().uuid(),
  priorityLevel: z.coerce.number().int().min(0).max(100).default(0),
});

export const queueIdSchema = z.object({
  id: z.string().uuid(),
});

export const queueListSchema = z.object({
  hospitalId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  status: z.enum([
    "WAITING",
    "CALLED",
    "IN_CONSULTATION",
    "SKIPPED",
    "RECALLED",
    "COMPLETED",
  ]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const queuePrioritySchema = z.object({
  priorityLevel: z.coerce.number().int().min(0).max(100),
});

export const queueCallSchema = z.object({
  roomId: z.string().uuid().optional(),
  counterId: z.string().uuid().optional(),
});

export const queueCheckInSchema = z.object({
  appointmentId: z.string().uuid(),
  priorityLevel: z.coerce.number().int().min(0).max(100).default(0),
});

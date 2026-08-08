import { z } from "zod";

export const patientListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  hospitalId: z.string().uuid().optional(),
});

export const patientIdSchema = z.object({
  id: z.string().uuid(),
});

export const patientUpdateSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dateOfBirth: z.coerce.date().optional(),
  bloodGroup: z.string().trim().max(5).optional(),
  address: z.string().trim().max(2000).optional(),
  emergencyContactName: z.string().trim().max(100).optional(),
  emergencyContactPhone: z.string().regex(/^[0-9]{10,15}$/).optional(),
});

import { z } from "zod";

export const doctorCreateSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  phoneNumber: z.string().regex(/^[0-9]{10,15}$/),
  password: z.string().min(8).max(72),
  hospitalId: z.string().uuid(),
  departmentId: z.string().uuid(),
  roomId: z.string().uuid().optional(),
  licenseNumber: z.string().trim().min(2).max(100),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  qualification: z.string().trim().min(2).max(255),
  consultationFee: z.coerce.number().min(0).max(99999999.99),
  isAvailable: z.boolean().optional(),
});

export const doctorUpdateSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  qualification: z.string().trim().min(2).max(255).optional(),
  departmentId: z.string().uuid().optional(),
  roomId: z.string().uuid().nullable().optional(),
  consultationFee: z.coerce.number().min(0).max(99999999.99).optional(),
  isAvailable: z.boolean().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
});

export const doctorListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  hospitalId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  available: z.enum(["true", "false"]).optional(),
});

export const doctorIdSchema = z.object({
  id: z.string().uuid(),
});

import { z } from "zod";

export const hospitalCreateSchema = z.object({
  cityId: z.string().uuid(),
  name: z.string().trim().min(2).max(255),
  code: z.string().trim().min(2).max(20).transform((v) => v.toUpperCase()),
  type: z.enum(["GOVERNMENT", "PRIVATE"]),
  speciality: z.enum([
    "EYE",
    "DENTAL",
    "AYURVEDIC",
    "HOMEOPATHY",
    "ALLOPATHY",
    "GENERAL",
  ]),
  address: z.string().trim().min(5),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  mapConfig: z.record(z.string(), z.unknown()).optional(),
  contactEmail: z.string().email().max(255),
  contactPhone: z.string().regex(/^[0-9]{10,15}$/),
});

export const hospitalUpdateSchema = hospitalCreateSchema.partial();

export const hospitalListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  cityId: z.string().uuid().optional(),
  type: z.enum(["GOVERNMENT", "PRIVATE"]).optional(),
  speciality: z
    .enum(["EYE", "DENTAL", "AYURVEDIC", "HOMEOPATHY", "ALLOPATHY", "GENERAL"])
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "DELETED"]).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

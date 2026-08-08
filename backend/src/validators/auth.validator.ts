import { z } from "zod";

/**
 * Patient Self Registration
 *
 * Note: `roleId` is intentionally NOT accepted from the client — a
 * self-registering user is always assigned the PATIENT role server-side.
 * `firstName`/`lastName`/`gender`/`dateOfBirth` are required because the
 * Patient model requires them; `uhid` is generated server-side.
 */
export const registerSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),

  phoneNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{10,15}$/, "Phone number must be 10-15 digits"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must not exceed 72 characters")
    .regex(/[A-Z]/, "Must contain one uppercase letter")
    .regex(/[a-z]/, "Must contain one lowercase letter")
    .regex(/[0-9]/, "Must contain one number")
    .regex(/[@$!%*?&#^()_+=-]/, "Must contain one special character"),

  firstName: z.string().trim().min(1, "First name is required").max(100),

  lastName: z.string().trim().min(1, "Last name is required").max(100),

  gender: z.enum(["MALE", "FEMALE", "OTHER"]),

  dateOfBirth: z.coerce
    .date()
    .refine((date) => date < new Date(), "Date of birth must be in the past"),

  bloodGroup: z.string().trim().max(5).optional(),

  address: z.string().trim().max(2000).optional(),

  emergencyContactName: z.string().trim().max(100).optional(),

  emergencyContactPhone: z
    .string()
    .trim()
    .regex(/^[0-9]{10,15}$/, "Emergency contact phone must be 10-15 digits")
    .optional(),

  hospitalId: z.string().uuid("Invalid hospital id").optional(),
});

/**
 * Login
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),

  password: z.string().min(1, "Password is required"),
});

/**
 * Refresh Token
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

/**
 * Logout
 */
export const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type LogoutDto = z.infer<typeof logoutSchema>;

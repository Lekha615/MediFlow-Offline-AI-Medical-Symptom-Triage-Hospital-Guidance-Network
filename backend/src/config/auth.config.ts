/**
 * Centralized Authentication & RBAC configuration.
 * Kept in one place so JWT signing, session expiry and validators
 * never drift out of sync with each other.
 */

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  HOSPITAL_ADMIN: "HOSPITAL_ADMIN",
  DOCTOR: "DOCTOR",
  RECEPTIONIST: "RECEPTIONIST",
  LAB_TECHNICIAN: "LAB_TECHNICIAN",
  PATIENT: "PATIENT",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const AUTH_CONFIG = {
  ACCESS_TOKEN_EXPIRES_IN: "15m",
  REFRESH_TOKEN_EXPIRES_IN: "7d",
  REFRESH_TOKEN_TTL_MS: 7 * 24 * 60 * 60 * 1000, // must mirror REFRESH_TOKEN_EXPIRES_IN above
  BCRYPT_SALT_ROUNDS: 12,
  UHID_PREFIX: "MF",
} as const;

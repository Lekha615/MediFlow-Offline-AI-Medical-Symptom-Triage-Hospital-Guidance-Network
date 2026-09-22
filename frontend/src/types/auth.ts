export type RoleName =
  | "SUPER_ADMIN"
  | "HOSPITAL_ADMIN"
  | "DOCTOR"
  | "RECEPTIONIST"
  | "LAB_TECHNICIAN"
  | "PATIENT";

export type EntityStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "DELETED";

export interface Role {
  id: string;
  name: RoleName;
  description?: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  roleId: string;
  hospitalId?: string | null;
  email: string;
  phoneNumber: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  role: Role;
  patient?: any;
  doctor?: any;
  staff?: any;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSuccessData extends AuthTokens {
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string; // YYYY-MM-DD
  bloodGroup?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  hospitalId?: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface LogoutPayload {
  refreshToken: string;
}

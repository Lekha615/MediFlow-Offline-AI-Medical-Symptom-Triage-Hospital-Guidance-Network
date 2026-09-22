import { EntityStatus, User } from "./auth";
import { Hospital } from "./hospital";

export type StaffType =
  | "RECEPTIONIST"
  | "LAB_TECHNICIAN"
  | "AMBULANCE_DRIVER"
  | "ADMIN"
  | "OTHER";

export interface Staff {
  id: string;
  userId: string;
  hospitalId: string;
  type: StaffType;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  hospital?: Hospital;
}

export interface StaffCreatePayload {
  email: string;
  phoneNumber: string;
  password: string;
  hospitalId: string;
  type: StaffType;
  firstName: string;
  lastName: string;
  status?: EntityStatus;
}

export interface StaffUpdatePayload {
  firstName?: string;
  lastName?: string;
  status?: EntityStatus;
}

export interface StaffListQuery {
  page?: number;
  limit?: number;
  hospitalId?: string;
  type?: StaffType;
  search?: string;
}

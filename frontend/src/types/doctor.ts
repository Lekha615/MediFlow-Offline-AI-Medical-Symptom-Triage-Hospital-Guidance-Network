import { EntityStatus, User } from "./auth";
import { Hospital } from "./hospital";

export interface Department {
  id: string;
  hospitalId: string;
  name: string;
  code: string;
  description?: string | null;
  status: EntityStatus;
}

export interface Room {
  id: string;
  hospitalId: string;
  departmentId: string;
  roomNumber: string;
  floor: string;
  status: EntityStatus;
}

export interface Doctor {
  id: string;
  userId: string;
  hospitalId: string;
  departmentId: string;
  roomId?: string | null;
  licenseNumber: string;
  firstName: string;
  lastName: string;
  qualification: string;
  consultationFee: number | string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  hospital?: Hospital;
  department?: Department;
  room?: Room | null;
}

export interface DoctorCreatePayload {
  email: string;
  phoneNumber: string;
  password: string;
  hospitalId: string;
  departmentId: string;
  roomId?: string;
  licenseNumber: string;
  firstName: string;
  lastName: string;
  qualification: string;
  consultationFee: number;
  isAvailable?: boolean;
}

export interface DoctorUpdatePayload {
  firstName?: string;
  lastName?: string;
  qualification?: string;
  departmentId?: string;
  roomId?: string | null;
  consultationFee?: number;
  isAvailable?: boolean;
  status?: EntityStatus;
}

export interface DoctorListQuery {
  page?: number;
  limit?: number;
  hospitalId?: string;
  departmentId?: string;
  search?: string;
  available?: "true" | "false";
}

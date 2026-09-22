import { User } from "./auth";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface Patient {
  id: string;
  userId: string;
  uhid: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  bloodGroup?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  appointments?: Appointment[];
  queues?: any[];
}

export interface Appointment {
  id: string;
  hospitalId: string;
  departmentId: string;
  doctorId: string;
  patientId: string;
  appointmentType: "WALK_IN" | "ONLINE" | "EMERGENCY" | "TELECONSULTATION";
  status: "BOOKED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  appointmentDate: string;
  slotTime: string;
  qrCodeData: string;
  tokenNumber: string;
  symptoms?: string | null;
  createdAt: string;
  doctor?: any;
  hospital?: any;
  department?: any;
}

export interface PatientUpdatePayload {
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  dateOfBirth?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface PatientListQuery {
  page?: number;
  limit?: number;
  search?: string;
  hospitalId?: string;
}

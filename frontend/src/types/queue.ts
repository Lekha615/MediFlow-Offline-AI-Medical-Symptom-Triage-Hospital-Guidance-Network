import { Doctor } from "./doctor";
import { Patient } from "./patient";
import { Hospital } from "./hospital";

export type QueueStatus =
  | "WAITING"
  | "CALLED"
  | "IN_CONSULTATION"
  | "SKIPPED"
  | "RECALLED"
  | "COMPLETED";

export interface QueueItem {
  id: string;
  hospitalId: string;
  departmentId: string;
  roomId?: string | null;
  counterId?: string | null;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  tokenNumber: number;
  status: QueueStatus;
  priorityLevel: number;
  estimatedWaitMinutes: number;
  checkedInAt?: string | null;
  calledAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  doctor?: Doctor;
  hospital?: Hospital;
  department?: any;
  room?: any;
}

export interface QueuePositionResponse {
  inQueue: boolean;
  queueItem?: QueueItem | null;
  waitingAhead?: number;
  estimatedWaitMinutes?: number;
}

export interface QueueCheckInPayload {
  appointmentId: string;
  priorityLevel?: number;
}

export interface QueueCallNextPayload {
  roomId?: string;
  counterId?: string;
}

export interface QueueStatusUpdatePayload {
  status: "CALLED" | "IN_CONSULTATION" | "SKIPPED" | "RECALLED" | "COMPLETED";
}

export interface QueuePriorityUpdatePayload {
  priorityLevel: number;
}

export interface QueueListQuery {
  hospitalId?: string;
  departmentId?: string;
  doctorId?: string;
  status?: QueueStatus;
  page?: number;
  limit?: number;
}

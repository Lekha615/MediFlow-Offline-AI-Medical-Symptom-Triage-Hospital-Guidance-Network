import { apiClient } from "./client";
import {
  Patient,
  PatientUpdatePayload,
  PatientListQuery,
  Appointment,
} from "../types/patient";
import { ApiResponse, PaginatedResult } from "../types/api";
import { QueueItem } from "../types/queue";

export const patientApi = {
  getMe: async (): Promise<Patient> => {
    const response = await apiClient.get<ApiResponse<Patient>>("/patients/me");
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error("Failed to load patient profile");
  },

  list: async (query?: PatientListQuery): Promise<PaginatedResult<Patient>> => {
    const response = await apiClient.get<ApiResponse<any>>(
      "/patients",
      { params: query }
    );
    if (response.data.data) {
      const resData = response.data.data;
      if (resData.items && Array.isArray(resData.items)) {
        return {
          data: resData.items,
          pagination: resData.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
        };
      }
      if (resData.data && Array.isArray(resData.data)) {
        return resData;
      }
      if (Array.isArray(resData)) {
        return {
          data: resData,
          pagination: { page: 1, limit: resData.length, total: resData.length, totalPages: 1 },
        };
      }
    }
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  },

  getById: async (id: string): Promise<Patient> => {
    const response = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error("Patient not found");
  },

  update: async (id: string, payload: PatientUpdatePayload): Promise<Patient> => {
    const response = await apiClient.patch<ApiResponse<Patient>>(`/patients/${id}`, payload);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to update patient profile");
  },

  getAppointments: async (id: string): Promise<Appointment[]> => {
    const response = await apiClient.get<ApiResponse<any>>(`/patients/${id}/appointments`);
    const resData = response.data.data;
    if (Array.isArray(resData)) {
      return resData;
    }
    if (resData && Array.isArray(resData.data)) {
      return resData.data;
    }
    return [];
  },

  getQueueHistory: async (id: string): Promise<QueueItem[]> => {
    const response = await apiClient.get<ApiResponse<any>>(`/patients/${id}/queue`);
    const resData = response.data.data;
    if (Array.isArray(resData)) {
      return resData;
    }
    if (resData && Array.isArray(resData.data)) {
      return resData.data;
    }
    return [];
  },
};

import { apiClient } from "./client";
import {
  Doctor,
  DoctorCreatePayload,
  DoctorUpdatePayload,
  DoctorListQuery,
} from "../types/doctor";
import { ApiResponse, PaginatedResult } from "../types/api";

export const doctorApi = {
  list: async (query?: DoctorListQuery): Promise<PaginatedResult<Doctor>> => {
    const response = await apiClient.get<ApiResponse<any>>(
      "/doctors",
      { params: query }
    );
    if (response.data.data) {
      const resData = response.data.data;
      if (resData.items && Array.isArray(resData.items)) {
        return {
          data: resData.items,
          pagination: resData.pagination || { page: 1, limit: 20, total: resData.items.length, totalPages: 1 },
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
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  },

  getById: async (id: string): Promise<Doctor> => {
    const response = await apiClient.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error("Doctor not found");
  },

  create: async (payload: DoctorCreatePayload): Promise<Doctor> => {
    const response = await apiClient.post<ApiResponse<Doctor>>("/doctors", payload);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to create doctor");
  },

  update: async (id: string, payload: DoctorUpdatePayload): Promise<Doctor> => {
    const response = await apiClient.patch<ApiResponse<Doctor>>(`/doctors/${id}`, payload);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to update doctor");
  },

  setAvailability: async (id: string, isAvailable: boolean): Promise<Doctor> => {
    const response = await apiClient.patch<ApiResponse<Doctor>>(`/doctors/${id}/availability`, {
      isAvailable,
    });
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to update availability");
  },
};

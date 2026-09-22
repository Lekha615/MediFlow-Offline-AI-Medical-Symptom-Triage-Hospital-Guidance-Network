import { apiClient } from "./client";
import {
  Hospital,
  HospitalCreatePayload,
  HospitalUpdatePayload,
  HospitalListQuery,
  City,
} from "../types/hospital";
import { ApiResponse, PaginatedResult } from "../types/api";

export const hospitalApi = {
  list: async (query?: HospitalListQuery): Promise<PaginatedResult<Hospital>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResult<Hospital>>>(
      "/hospitals",
      { params: query }
    );
    if (response.data.data) {
      return response.data.data;
    }
    return {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  },

  getById: async (id: string): Promise<Hospital> => {
    const response = await apiClient.get<ApiResponse<Hospital>>(`/hospitals/${id}`);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error("Hospital not found");
  },

  create: async (payload: HospitalCreatePayload): Promise<Hospital> => {
    const response = await apiClient.post<ApiResponse<Hospital>>("/hospitals", payload);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to create hospital");
  },

  update: async (id: string, payload: HospitalUpdatePayload): Promise<Hospital> => {
    const response = await apiClient.patch<ApiResponse<Hospital>>(`/hospitals/${id}`, payload);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to update hospital");
  },

  setStatus: async (id: string, status: "ACTIVE" | "INACTIVE" | "SUSPENDED"): Promise<Hospital> => {
    const response = await apiClient.patch<ApiResponse<Hospital>>(`/hospitals/${id}/status`, { status });
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to update hospital status");
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/hospitals/${id}`);
  },

  getCities: async (): Promise<City[]> => {
    // Helper to get cities if available or provide standard fallback list
    try {
      const response = await apiClient.get<ApiResponse<City[]>>("/cities");
      return response.data.data || [];
    } catch {
      return [];
    }
  },
};

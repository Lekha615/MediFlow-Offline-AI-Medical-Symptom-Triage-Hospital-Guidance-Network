import { apiClient } from "./client";
import {
  Hospital,
  HospitalCreatePayload,
  HospitalUpdatePayload,
  HospitalListQuery,
  City,
  State,
} from "../types/hospital";
import { ApiResponse, PaginatedResult } from "../types/api";

export const hospitalApi = {
  list: async (query?: HospitalListQuery): Promise<PaginatedResult<Hospital> & { items: Hospital[] }> => {
    const response = await apiClient.get<ApiResponse<any>>(
      "/hospitals",
      { params: query }
    );
    if (response.data.data) {
      const resData = response.data.data;
      const items: Hospital[] =
        resData.data && Array.isArray(resData.data)
          ? resData.data
          : resData.items && Array.isArray(resData.items)
          ? resData.items
          : Array.isArray(resData)
          ? resData
          : [];

      const pagination = resData.pagination || {
        page: 1,
        limit: 20,
        total: items.length,
        totalPages: 1,
      };

      return {
        data: items,
        items,
        pagination,
      };
    }
    return {
      data: [],
      items: [],
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

  getStates: async (): Promise<State[]> => {
    try {
      const response = await apiClient.get<ApiResponse<State[]>>("/states");
      return response.data.data || [];
    } catch {
      return [];
    }
  },

  getCities: async (stateId?: string): Promise<City[]> => {
    try {
      const response = await apiClient.get<ApiResponse<City[]>>("/cities", {
        params: stateId ? { stateId } : undefined,
      });
      return response.data.data || [];
    } catch {
      return [];
    }
  },

  importCsv: async (csvContent: string): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>("/hospitals/import", {
      csvContent,
    });
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to import CSV");
  },
};

import { apiClient } from "./client";
import {
  Staff,
  StaffCreatePayload,
  StaffUpdatePayload,
  StaffListQuery,
} from "../types/staff";
import { ApiResponse, PaginatedResult } from "../types/api";

export const staffApi = {
  list: async (query?: StaffListQuery): Promise<PaginatedResult<Staff>> => {
    const response = await apiClient.get<ApiResponse<any>>(
      "/staff",
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

  getById: async (id: string): Promise<Staff> => {
    const response = await apiClient.get<ApiResponse<Staff>>(`/staff/${id}`);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error("Staff member not found");
  },

  create: async (payload: StaffCreatePayload): Promise<Staff> => {
    const response = await apiClient.post<ApiResponse<Staff>>("/staff", payload);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to provision staff member");
  },

  update: async (id: string, payload: StaffUpdatePayload): Promise<Staff> => {
    const response = await apiClient.patch<ApiResponse<Staff>>(`/staff/${id}`, payload);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to update staff member");
  },
};

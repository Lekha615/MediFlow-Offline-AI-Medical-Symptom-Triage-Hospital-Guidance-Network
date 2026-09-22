import { apiClient } from "./client";
import {
  QueueItem,
  QueuePositionResponse,
  QueueCheckInPayload,
  QueueCallNextPayload,
  QueueStatusUpdatePayload,
  QueuePriorityUpdatePayload,
  QueueListQuery,
} from "../types/queue";
import { ApiResponse, PaginatedResult } from "../types/api";

export const queueApi = {
  getMyPosition: async (): Promise<QueuePositionResponse> => {
    const response = await apiClient.get<ApiResponse<QueuePositionResponse>>(
      "/queue/my-position"
    );
    if (response.data.data) {
      return response.data.data;
    }
    return { inQueue: false };
  },

  list: async (query?: QueueListQuery): Promise<PaginatedResult<QueueItem>> => {
    const response = await apiClient.get<ApiResponse<any>>(
      "/queue",
      { params: query }
    );
    if (response.data.data) {
      const resData = response.data.data;
      if (resData.items && Array.isArray(resData.items)) {
        return {
          data: resData.items,
          pagination: resData.pagination || { page: 1, limit: 50, total: resData.items.length, totalPages: 1 },
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
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
    };
  },

  getById: async (id: string): Promise<QueueItem> => {
    const response = await apiClient.get<ApiResponse<QueueItem>>(`/queue/${id}`);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error("Queue item not found");
  },

  checkIn: async (payload: QueueCheckInPayload): Promise<QueueItem> => {
    const response = await apiClient.post<ApiResponse<QueueItem>>(
      "/queue/check-in",
      payload
    );
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to check in patient");
  },

  callNext: async (id: string, payload?: QueueCallNextPayload): Promise<QueueItem> => {
    const response = await apiClient.post<ApiResponse<QueueItem>>(
      `/queue/${id}/call-next`,
      payload || {}
    );
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to call next patient");
  },

  setStatus: async (
    id: string,
    payload: QueueStatusUpdatePayload
  ): Promise<QueueItem> => {
    const response = await apiClient.patch<ApiResponse<QueueItem>>(
      `/queue/${id}/status`,
      payload
    );
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to update queue status");
  },

  updatePriority: async (
    id: string,
    payload: QueuePriorityUpdatePayload
  ): Promise<QueueItem> => {
    const response = await apiClient.patch<ApiResponse<QueueItem>>(
      `/queue/${id}/priority`,
      payload
    );
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to update priority");
  },
};

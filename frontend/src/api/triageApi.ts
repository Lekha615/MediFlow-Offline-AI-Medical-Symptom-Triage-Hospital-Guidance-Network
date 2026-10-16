
import { apiClient } from "./client";

export interface TriageRequest {
  symptoms: string[];
  severity: number;
  has_red_flags: boolean;
}

export interface TriagePrediction {
  disease: string;
  specialist: string;
  urgency: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  confidence: number;
  triage_summary: string;
}

interface TriageApiResponse {
  success: boolean;
  data: TriagePrediction;
  notice: string;
}

export const triageApi = {
  async evaluate(input: TriageRequest): Promise<TriageApiResponse> {
    const response = await apiClient.post<TriageApiResponse>(
      "/triage",
      input
    );
    return response.data;
  },
};

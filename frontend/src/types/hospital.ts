import { EntityStatus } from "./auth";

export type HospitalType = "GOVERNMENT" | "PRIVATE";
export type SpecialityType =
  | "EYE"
  | "DENTAL"
  | "AYURVEDIC"
  | "HOMEOPATHY"
  | "ALLOPATHY"
  | "GENERAL";

export interface City {
  id: string;
  name: string;
  stateId: string;
  state?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface Hospital {
  id: string;
  cityId: string;
  name: string;
  code: string;
  type: HospitalType;
  speciality: SpecialityType;
  address: string;
  latitude: number;
  longitude: number;
  contactEmail: string;
  contactPhone: string;
  status: EntityStatus;
  mapConfig?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  city?: City;
  _count?: {
    doctors?: number;
    departments?: number;
    patients?: number;
  };
}

export interface HospitalCreatePayload {
  cityId: string;
  name: string;
  code: string;
  type: HospitalType;
  speciality: SpecialityType;
  address: string;
  latitude: number;
  longitude: number;
  contactEmail: string;
  contactPhone: string;
  mapConfig?: Record<string, unknown>;
}

export interface HospitalUpdatePayload extends Partial<HospitalCreatePayload> {
  status?: EntityStatus;
}

export interface HospitalListQuery {
  page?: number;
  limit?: number;
  search?: string;
  cityId?: string;
  type?: HospitalType;
  speciality?: SpecialityType;
  status?: EntityStatus;
}

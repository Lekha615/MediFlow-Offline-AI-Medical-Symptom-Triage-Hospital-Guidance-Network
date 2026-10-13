import { EntityStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/api-error";

export class HospitalService {
  static async create(data: Prisma.HospitalCreateInput) {
    const city = await prisma.city.findUnique({
      where: { id: data.city?.connect?.id },
      select: { id: true },
    });

    if (!city) {
      throw AppError.badRequest("Invalid city.");
    }

    const existing = await prisma.hospital.findUnique({
      where: { code: data.code as string },
      select: { id: true },
    });

    if (existing) {
      throw AppError.conflict("Hospital code already exists.");
    }

    return prisma.hospital.create({
      data,
      include: {
        city: { include: { state: true } },
      },
    });
  }

  static async getById(id: string) {
    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: {
        city: { include: { state: true } },
        departments: {
          where: { status: { not: EntityStatus.DELETED } },
          orderBy: { name: "asc" },
        },
        doctors: {
          include: {
            department: true,
          },
          orderBy: [{ isAvailable: "desc" }, { firstName: "asc" }],
        },
      },
    });

    if (!hospital || hospital.status === EntityStatus.DELETED) {
      throw AppError.notFound("Hospital not found.");
    }

    return hospital;
  }

  static async list(params: {
    page: number;
    limit: number;
    search?: string;
    stateId?: string;
    cityId?: string;
    type?: "GOVERNMENT" | "PRIVATE";
    speciality?: "EYE" | "DENTAL" | "AYURVEDIC" | "HOMEOPATHY" | "ALLOPATHY" | "GENERAL";
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "DELETED";
    isVerified?: boolean;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const { search, stateId, cityId, type, speciality, status, isVerified } = params;

    const where: Prisma.HospitalWhereInput = {
      status: status ?? { not: EntityStatus.DELETED },
      ...(isVerified !== undefined ? { isVerified } : {}),
      ...(cityId ? { cityId } : stateId ? { city: { stateId } } : {}),
      ...(type ? { type } : {}),
      ...(speciality ? { speciality } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } },
              { address: { contains: search, mode: "insensitive" } },
              { city: { name: { contains: search, mode: "insensitive" } } },
              { city: { state: { name: { contains: search, mode: "insensitive" } } } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.hospital.findMany({
        where,
        include: {
          city: { include: { state: true } },
          departments: {
            where: { status: { not: EntityStatus.DELETED } },
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: {
              doctors: true,
              departments: true,
            },
          },
        },
        orderBy: [{ isVerified: "desc" }, { name: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.hospital.count({ where }),
    ]);

    return {
      items,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async update(id: string, data: Prisma.HospitalUpdateInput) {
    await this.getById(id);

    if (data.code && typeof data.code === "string") {
      const duplicate = await prisma.hospital.findFirst({
        where: { code: data.code, NOT: { id } },
        select: { id: true },
      });
      if (duplicate) {
        throw AppError.conflict("Hospital code already exists.");
      }
    }

    if (data.city?.connect?.id) {
      const city = await prisma.city.findUnique({
        where: { id: data.city.connect.id },
        select: { id: true },
      });
      if (!city) throw AppError.badRequest("Invalid city.");
    }

    return prisma.hospital.update({
      where: { id },
      data,
      include: { city: { include: { state: true } } },
    });
  }

  static async setStatus(id: string, status: EntityStatus) {
    await this.getById(id);
    return prisma.hospital.update({
      where: { id },
      data: { status },
    });
  }

  static async remove(id: string) {
    await this.getById(id);
    return prisma.hospital.update({
      where: { id },
      data: { status: EntityStatus.DELETED },
    });
  }
}

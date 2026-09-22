import { EntityStatus, Prisma, StaffType } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/api-error";
import { hashPassword } from "../utils/password";
import { ROLES } from "../config/auth.config";

export class StaffService {
  static async create(data: {
    email: string;
    phoneNumber: string;
    password: string;
    hospitalId: string;
    type: StaffType;
    firstName: string;
    lastName: string;
    status?: EntityStatus;
  }) {
    const [hospital, emailExists, phoneExists] = await Promise.all([
      prisma.hospital.findUnique({ where: { id: data.hospitalId }, select: { id: true } }),
      prisma.user.findUnique({ where: { email: data.email }, select: { id: true } }),
      prisma.user.findUnique({ where: { phoneNumber: data.phoneNumber }, select: { id: true } }),
    ]);

    if (!hospital) throw AppError.badRequest("Hospital not found.");
    if (emailExists) throw AppError.conflict("Email is already registered.");
    if (phoneExists) throw AppError.conflict("Phone number is already registered.");

    // Map staff type to Role name
    let roleName: string = ROLES.RECEPTIONIST;
    if (data.type === "LAB_TECHNICIAN") {
      roleName = ROLES.LAB_TECHNICIAN;
    } else if (data.type === "ADMIN") {
      roleName = ROLES.HOSPITAL_ADMIN;
    }

    const role = await prisma.role.findUnique({
      where: { name: roleName },
      select: { id: true },
    });

    if (!role) {
      throw AppError.badRequest(`Role ${roleName} is not configured in the system.`);
    }

    const passwordHash = await hashPassword(data.password);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          phoneNumber: data.phoneNumber,
          passwordHash,
          roleId: role.id,
          hospitalId: data.hospitalId,
          status: data.status ?? EntityStatus.ACTIVE,
        },
      });

      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          hospitalId: data.hospitalId,
          type: data.type,
          firstName: data.firstName,
          lastName: data.lastName,
        },
        include: {
          hospital: true,
          user: {
            select: { id: true, email: true, phoneNumber: true, status: true, role: true },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "STAFF_PROVISIONED",
          entity: "Staff",
          entityId: staff.id,
        },
      });

      return staff;
    });
  }

  static async getById(id: string) {
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        hospital: true,
        user: { select: { id: true, email: true, phoneNumber: true, status: true, role: true } },
      },
    });

    if (!staff) throw AppError.notFound("Staff member not found.");
    return staff;
  }

  static async list(params: {
    page: number;
    limit: number;
    hospitalId?: string;
    type?: StaffType;
    search?: string;
  }) {
    const { page, limit, hospitalId, type, search } = params;
    const where: Prisma.StaffWhereInput = {
      ...(hospitalId ? { hospitalId } : {}),
      ...(type ? { type } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { user: { email: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.staff.findMany({
        where,
        include: {
          hospital: true,
          user: { select: { id: true, email: true, phoneNumber: true, status: true, role: true } },
        },
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.staff.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      status?: EntityStatus;
    }
  ) {
    const staff = await this.getById(id);

    return prisma.staff.update({
      where: { id },
      data: {
        ...(data.firstName ? { firstName: data.firstName } : {}),
        ...(data.lastName ? { lastName: data.lastName } : {}),
        ...(data.status ? { user: { update: { status: data.status } } } : {}),
      },
      include: {
        hospital: true,
        user: { select: { id: true, email: true, phoneNumber: true, status: true, role: true } },
      },
    });
  }
}

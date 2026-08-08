import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/api-error";
import { hashPassword } from "../utils/password";
import { ROLES } from "../config/auth.config";

export class DoctorService {
  static async create(data: {
    email: string;
    phoneNumber: string;
    password: string;
    hospitalId: string;
    departmentId: string;
    roomId?: string;
    licenseNumber: string;
    firstName: string;
    lastName: string;
    qualification: string;
    consultationFee: number;
    isAvailable?: boolean;
  }) {
    const [hospital, department, role, emailExists, phoneExists, licenseExists] =
      await Promise.all([
        prisma.hospital.findUnique({ where: { id: data.hospitalId }, select: { id: true } }),
        prisma.department.findUnique({
          where: { id: data.departmentId },
          select: { id: true, hospitalId: true },
        }),
        prisma.role.findUnique({ where: { name: ROLES.DOCTOR }, select: { id: true } }),
        prisma.user.findUnique({ where: { email: data.email }, select: { id: true } }),
        prisma.user.findUnique({ where: { phoneNumber: data.phoneNumber }, select: { id: true } }),
        prisma.doctor.findUnique({ where: { licenseNumber: data.licenseNumber }, select: { id: true } }),
      ]);

    if (!hospital) throw AppError.badRequest("Hospital not found.");
    if (!department || department.hospitalId !== data.hospitalId) {
      throw AppError.badRequest("Department does not belong to the selected hospital.");
    }
    if (!role) throw AppError.badRequest("DOCTOR role is not configured.");
    if (emailExists) throw AppError.conflict("Email is already registered.");
    if (phoneExists) throw AppError.conflict("Phone number is already registered.");
    if (licenseExists) throw AppError.conflict("License number already exists.");

    if (data.roomId) {
      const room = await prisma.room.findUnique({
        where: { id: data.roomId },
        select: { id: true, hospitalId: true, departmentId: true },
      });
      if (
        !room ||
        room.hospitalId !== data.hospitalId ||
        room.departmentId !== data.departmentId
      ) {
        throw AppError.badRequest("Room does not belong to the selected department.");
      }
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
        },
      });

      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          hospitalId: data.hospitalId,
          departmentId: data.departmentId,
          roomId: data.roomId,
          licenseNumber: data.licenseNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          qualification: data.qualification,
          consultationFee: new Prisma.Decimal(data.consultationFee),
          isAvailable: data.isAvailable ?? true,
        },
        include: {
          department: true,
          room: true,
          hospital: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "DOCTOR_CREATED",
          entity: "Doctor",
          entityId: doctor.id,
        },
      });

      return doctor;
    });
  }

  static async getById(id: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        hospital: true,
        department: true,
        room: true,
        user: { select: { id: true, email: true, phoneNumber: true, status: true } },
      },
    });
    if (!doctor) throw AppError.notFound("Doctor not found.");
    return doctor;
  }

  static async list(params: {
    page: number;
    limit: number;
    hospitalId?: string;
    departmentId?: string;
    search?: string;
    available?: "true" | "false";
  }) {
    const { page, limit, hospitalId, departmentId, search, available } = params;
    const where: Prisma.DoctorWhereInput = {
      ...(hospitalId ? { hospitalId } : {}),
      ...(departmentId ? { departmentId } : {}),
      ...(available !== undefined ? { isAvailable: available === "true" } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { licenseNumber: { contains: search, mode: "insensitive" } },
              { qualification: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.doctor.findMany({
        where,
        include: { hospital: true, department: true, room: true },
        orderBy: [{ isAvailable: "desc" }, { firstName: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.doctor.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async update(id: string, data: {
    firstName?: string;
    lastName?: string;
    qualification?: string;
    departmentId?: string;
    roomId?: string | null;
    consultationFee?: number;
    isAvailable?: boolean;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  }) {
    const doctor = await this.getById(id);

    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId },
        select: { id: true, hospitalId: true },
      });
      if (!department || department.hospitalId !== doctor.hospitalId) {
        throw AppError.badRequest("Invalid department for this hospital.");
      }
    }

    if (data.roomId) {
      const departmentId = data.departmentId ?? doctor.departmentId;
      const room = await prisma.room.findUnique({
        where: { id: data.roomId },
        select: { id: true, hospitalId: true, departmentId: true },
      });
      if (
        !room ||
        room.hospitalId !== doctor.hospitalId ||
        room.departmentId !== departmentId
      ) {
        throw AppError.badRequest("Invalid room for this department.");
      }
    }

    const updateData: Prisma.DoctorUpdateInput = {
      ...(data.firstName !== undefined ? { firstName: data.firstName } : {}),
      ...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
      ...(data.qualification !== undefined ? { qualification: data.qualification } : {}),
      ...(data.departmentId
        ? { department: { connect: { id: data.departmentId } } }
        : {}),
      ...(data.roomId !== undefined
        ? data.roomId
          ? { room: { connect: { id: data.roomId } } }
          : { room: { disconnect: true } }
        : {}),
      ...(data.consultationFee !== undefined
        ? { consultationFee: new Prisma.Decimal(data.consultationFee) }
        : {}),
      ...(data.isAvailable !== undefined ? { isAvailable: data.isAvailable } : {}),
      ...(data.status !== undefined ? { user: { update: { status: data.status } } } : {}),
    };

    return prisma.doctor.update({
      where: { id },
      data: updateData,
      include: { hospital: true, department: true, room: true },
    });
  }

  static async setAvailability(id: string, isAvailable: boolean) {
    await this.getById(id);
    return prisma.doctor.update({
      where: { id },
      data: { isAvailable },
    });
  }
}

import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/api-error";

const safeUser = {
  id: true,
  email: true,
  phoneNumber: true,
  status: true,
  hospitalId: true,
} satisfies Prisma.UserSelect;

export class PatientService {
  static async getById(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: { select: safeUser },
      },
    });

    if (!patient) throw AppError.notFound("Patient not found.");
    return patient;
  }

  static async list(params: {
    page: number;
    limit: number;
    search?: string;
    hospitalId?: string;
  }) {
    const { page, limit, search, hospitalId } = params;

    const where: Prisma.PatientWhereInput = {
      ...(hospitalId ? { user: { hospitalId } } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { uhid: { contains: search, mode: "insensitive" } },
              { user: { email: { contains: search, mode: "insensitive" } } },
              { user: { phoneNumber: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.patient.findMany({
        where,
        include: { user: { select: safeUser } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.patient.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async update(id: string, data: Prisma.PatientUpdateInput) {
    await this.getById(id);
    return prisma.patient.update({
      where: { id },
      data,
      include: { user: { select: safeUser } },
    });
  }

  static async getMyProfile(userId: string) {
    const patient = await prisma.patient.findUnique({
      where: { userId },
      include: { user: { select: safeUser } },
    });

    if (!patient) throw AppError.notFound("Patient profile not found.");
    return patient;
  }

  static async getAppointments(id: string) {
    await this.getById(id);
    return prisma.appointment.findMany({
      where: { patientId: id },
      include: {
        hospital: true,
        department: true,
        doctor: true,
        queue: true,
      },
      orderBy: { appointmentDate: "desc" },
    });
  }

  static async getQueue(id: string) {
    await this.getById(id);
    return prisma.queue.findMany({
      where: { patientId: id },
      include: {
        hospital: true,
        department: true,
        doctor: true,
        room: true,
        counter: true,
        appointment: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

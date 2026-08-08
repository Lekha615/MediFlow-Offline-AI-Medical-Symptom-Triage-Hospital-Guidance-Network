import { Prisma, QueueStatus, AppointmentStatus } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/api-error";
import { emitQueueUpdate } from "../config/socket";

const queueInclude = {
  patient: true,
  doctor: true,
  department: true,
  room: true,
  counter: true,
  appointment: true,
  hospital: true,
} satisfies Prisma.QueueInclude;

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

export class QueueService {
  static async checkIn(appointmentId: string, priorityLevel = 0) {
    const { start, end } = getTodayRange();

    const result = await prisma.$transaction(
      async (tx) => {
        const appointment = await tx.appointment.findUnique({
          where: { id: appointmentId },
          include: {
            patient: true,
            doctor: true,
            department: true,
            hospital: true,
            queue: true,
          },
        });

        if (!appointment) throw AppError.notFound("Appointment not found.");
        if (appointment.queue) throw AppError.conflict("Appointment is already in the queue.");

        const appointmentDate = new Date(appointment.appointmentDate);
        if (appointmentDate < start || appointmentDate >= end) {
          throw AppError.badRequest("Only today's appointments can be checked into the live queue.");
        }

        if (
          appointment.status !== AppointmentStatus.BOOKED &&
          appointment.status !== AppointmentStatus.CHECKED_IN
        ) {
          throw AppError.badRequest("Appointment cannot be checked into the queue in its current status.");
        }

        const last = await tx.queue.findFirst({
          where: {
            hospitalId: appointment.hospitalId,
            departmentId: appointment.departmentId,
            createdAt: { gte: start, lt: end },
          },
          orderBy: { tokenNumber: "desc" },
          select: { tokenNumber: true },
        });

        const tokenNumber = (last?.tokenNumber ?? 0) + 1;

        const queue = await tx.queue.create({
          data: {
            hospitalId: appointment.hospitalId,
            departmentId: appointment.departmentId,
            appointmentId: appointment.id,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            tokenNumber,
            priorityLevel,
            status: QueueStatus.WAITING,
            estimatedWaitMinutes: 0,
            checkedInAt: new Date(),
          },
          include: queueInclude,
        });

        await tx.appointment.update({
          where: { id: appointment.id },
          data: {
            status: AppointmentStatus.CHECKED_IN,
            tokenNumber: String(tokenNumber),
          },
        });

        return queue;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    await this.recalculateWaitTimes(result.hospitalId, result.departmentId);

    emitQueueUpdate(
      result.hospitalId,
      result.departmentId,
      "queue:updated",
      { queueId: result.id, tokenNumber: result.tokenNumber }
    );

    return this.getById(result.id);
  }

  static async getById(id: string) {
    const queue = await prisma.queue.findUnique({
      where: { id },
      include: queueInclude,
    });
    if (!queue) throw AppError.notFound("Queue entry not found.");
    return queue;
  }

  static async list(params: {
    hospitalId?: string;
    departmentId?: string;
    doctorId?: string;
    status?: QueueStatus;
    page: number;
    limit: number;
  }) {
    const { page, limit, hospitalId, departmentId, doctorId, status } = params;
    const where: Prisma.QueueWhereInput = {
      ...(hospitalId ? { hospitalId } : {}),
      ...(departmentId ? { departmentId } : {}),
      ...(doctorId ? { doctorId } : {}),
      ...(status ? { status } : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.queue.findMany({
        where,
        include: queueInclude,
        orderBy: [
          { priorityLevel: "desc" },
          { createdAt: "asc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.queue.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async callNext(id: string, roomId?: string, counterId?: string) {
    const current = await this.getById(id);

    if (
      current.status !== QueueStatus.WAITING &&
      current.status !== QueueStatus.RECALLED
    ) {
      throw AppError.badRequest("Only waiting or recalled tokens can be called.");
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const next = await tx.queue.findFirst({
          where: {
            hospitalId: current.hospitalId,
            departmentId: current.departmentId,
            doctorId: current.doctorId,
            status: QueueStatus.WAITING,
          },
          orderBy: [{ priorityLevel: "desc" }, { createdAt: "asc" }],
        });

        if (!next) throw AppError.notFound("No waiting patient is available.");

        if (roomId) {
          const room = await tx.room.findUnique({
            where: { id: roomId },
            select: { id: true, hospitalId: true, departmentId: true },
          });
          if (!room || room.hospitalId !== next.hospitalId || room.departmentId !== next.departmentId) {
            throw AppError.badRequest("Invalid room for this queue.");
          }
        }

        if (counterId) {
          const counter = await tx.counter.findUnique({
            where: { id: counterId },
            select: { id: true, hospitalId: true },
          });
          if (!counter || counter.hospitalId !== next.hospitalId) {
            throw AppError.badRequest("Invalid counter for this queue.");
          }
        }

        return tx.queue.update({
          where: { id: next.id },
          data: {
            status: QueueStatus.CALLED,
            calledAt: new Date(),
            roomId,
            counterId,
          },
          include: queueInclude,
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    emitQueueUpdate(result.hospitalId, result.departmentId, "queue:token-called", {
      queueId: result.id,
      tokenNumber: result.tokenNumber,
      status: result.status,
    });

    return result;
  }

  static async setStatus(id: string, status: QueueStatus) {
    const current = await this.getById(id);

    const allowed: Record<QueueStatus, QueueStatus[]> = {
      WAITING: [QueueStatus.CALLED, QueueStatus.SKIPPED],
      CALLED: [QueueStatus.IN_CONSULTATION, QueueStatus.SKIPPED, QueueStatus.RECALLED],
      IN_CONSULTATION: [QueueStatus.COMPLETED],
      SKIPPED: [QueueStatus.RECALLED, QueueStatus.COMPLETED],
      RECALLED: [QueueStatus.CALLED, QueueStatus.SKIPPED],
      COMPLETED: [],
    };

    if (!allowed[current.status].includes(status)) {
      throw AppError.badRequest(`Cannot change queue status from ${current.status} to ${status}.`);
    }

    const data: Prisma.QueueUpdateInput = { status };

    if (status === QueueStatus.IN_CONSULTATION) {
      data.calledAt = current.calledAt ?? new Date();
    }

    if (status === QueueStatus.COMPLETED) {
      data.completedAt = new Date();
      data.appointment = { update: { status: AppointmentStatus.COMPLETED } };
    }

    const result = await prisma.queue.update({
      where: { id },
      data,
      include: queueInclude,
    });

    const event =
      status === QueueStatus.SKIPPED
        ? "queue:token-skipped"
        : status === QueueStatus.RECALLED
        ? "queue:token-recalled"
        : "queue:updated";

    emitQueueUpdate(result.hospitalId, result.departmentId, event, {
      queueId: result.id,
      tokenNumber: result.tokenNumber,
      status: result.status,
    });

    await this.recalculateWaitTimes(result.hospitalId, result.departmentId);

    return result;
  }

  static async getPatientPositionFromUser(userId: string) {
    const patient = await prisma.patient.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!patient) throw AppError.notFound("Patient profile not found.");
    return this.getPatientPosition(patient.id);
  }

  static async updatePriority(id: string, priorityLevel: number) {
    const current = await this.getById(id);

    if (current.status !== QueueStatus.WAITING &&
      current.status !== QueueStatus.RECALLED
) {
      throw AppError.badRequest(
    "Priority can only be changed for waiting or recalled tokens."
  );
  }

    const result = await prisma.queue.update({
      where: { id },
      data: { priorityLevel },
      include: queueInclude,
    });

    await this.recalculateWaitTimes(result.hospitalId, result.departmentId);

    emitQueueUpdate(result.hospitalId, result.departmentId, "queue:updated", {
      queueId: result.id,
      tokenNumber: result.tokenNumber,
      priorityLevel: result.priorityLevel,
    });

    return this.getById(id);
  }

  static async getPatientPosition(patientId: string) {
    const active = await prisma.queue.findMany({
      where: {
        patientId,
        status: { in: [QueueStatus.WAITING, QueueStatus.RECALLED] },
      },
      include: queueInclude,
      orderBy: { createdAt: "asc" },
    });

    return active.map((entry) => ({
      queueId: entry.id,
      tokenNumber: entry.tokenNumber,
      status: entry.status,
      priorityLevel: entry.priorityLevel,
      estimatedWaitMinutes: entry.estimatedWaitMinutes,
      aheadCount: active.filter(
        (x) =>
          x.id !== entry.id &&
          (x.priorityLevel > entry.priorityLevel ||
            (x.priorityLevel === entry.priorityLevel &&
              x.createdAt < entry.createdAt))
      ).length,
    }));
  }

  static async recalculateWaitTimes(hospitalId: string, departmentId: string) {
    const active = await prisma.queue.findMany({
      where: {
        hospitalId,
        departmentId,
        status: { in: [QueueStatus.WAITING, QueueStatus.RECALLED] },
      },
      orderBy: [{ priorityLevel: "desc" }, { createdAt: "asc" }],
      select: { id: true, priorityLevel: true },
    });

    const averageConsultationMinutes = 15;

    await prisma.$transaction(
      active.map((entry, index) =>
        prisma.queue.update({
          where: { id: entry.id },
          data: {
            estimatedWaitMinutes:
              (index + 1) * averageConsultationMinutes,
          },
        })
      )
    );
  }
}

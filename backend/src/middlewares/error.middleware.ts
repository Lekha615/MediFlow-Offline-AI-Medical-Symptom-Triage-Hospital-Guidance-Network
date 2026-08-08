import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/api-error";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details
        ? { errors: err.details }
        : {}),
    });
  }

  if (
    err instanceof Prisma.PrismaClientKnownRequestError
  ) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message:
          "A record with this value already exists.",
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message:
          "Requested record was not found.",
      });
    }
  }

  if (err instanceof Error) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
};
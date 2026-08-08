export class AppError extends Error {
  statusCode: number;
  details?: unknown;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    details?: unknown
  ) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(
    message: string,
    details?: unknown
  ) {
    return new AppError(
      message,
      400,
      details
    );
  }

  static unauthorized(
    message: string = "Unauthorized"
  ) {
    return new AppError(
      message,
      401
    );
  }

  static forbidden(
    message: string = "Forbidden"
  ) {
    return new AppError(
      message,
      403
    );
  }

  static notFound(
    message: string = "Resource not found"
  ) {
    return new AppError(
      message,
      404
    );
  }

  static conflict(
    message: string,
    details?: unknown
  ) {
    return new AppError(
      message,
      409,
      details
    );
  }
}
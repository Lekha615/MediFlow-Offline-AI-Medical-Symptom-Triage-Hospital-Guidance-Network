import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../utils/jwt";
import { AppError } from "../utils/api-error";
import { RoleName } from "../config/auth.config";
import { prisma } from "../config/db";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * Verifies the Bearer access token and attaches the decoded payload to
 * `req.user`. Must run before `authorize` / `requirePermission`.
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Access token missing"));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(AppError.unauthorized("Access token missing"));
  }

  try {
    const payload = verifyAccessToken(token);
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch {
    next(AppError.unauthorized("Invalid or expired access token"));
  }
};

/**
 * RBAC guard: restricts a route to a fixed set of role names.
 * Usage: router.get("/admin", authenticate, authorize(ROLES.SUPER_ADMIN), handler)
 */
export const authorize = (...allowedRoles: RoleName[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return next(AppError.unauthorized("Authentication required"));
    }

    if (!allowedRoles.includes(user.role as RoleName)) {
      return next(
        AppError.forbidden("You do not have permission to perform this action")
      );
    }

    next();
  };
};

/**
 * Fine-grained RBAC guard: restricts a route to roles holding specific
 * permission slugs (see Role / Permission / RolePermission in the schema).
 * Usage: router.post("/reports", authenticate, requirePermission("reports:upload"), handler)
 */
export const requirePermission = (...requiredSlugs: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthenticatedRequest).user;

      if (!user) {
        throw AppError.unauthorized("Authentication required");
      }

      const role = await prisma.role.findUnique({
        where: { name: user.role },
        include: {
          rolePermissions: {
            include: { permission: true },
          },
        },
      });

      const grantedSlugs = new Set(
        role?.rolePermissions.map((rp) => rp.permission.slug) ?? []
      );

      const hasAllPermissions = requiredSlugs.every((slug) =>
        grantedSlugs.has(slug)
      );

      if (!hasAllPermissions) {
        throw AppError.forbidden("You do not have the required permissions");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

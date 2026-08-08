import { prisma } from "../config/db";
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  LogoutDto,
} from "../validators/auth.validator";
import {
  hashPassword,
  comparePassword,
} from "../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt";
import { AppError } from "../utils/api-error";

export class AuthService {
  /**
   * Register Patient
   */
  static async register(data: RegisterDto) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phoneNumber: data.phoneNumber },
        ],
      },
    });

    if (existingUser) {
      throw AppError.conflict(
        "Email or phone number is already registered."
      );
    }

    /**
     * Patient role
     */
    const patientRole = await prisma.role.findUnique({
      where: {
        name: "PATIENT",
      },
    });

    if (!patientRole) {
      throw AppError.badRequest(
        "PATIENT role is not configured."
      );
    }

    const hashedPassword =
      await hashPassword(data.password);

    /**
     * Generate UHID
     */
    const uhid =
      `MF-${Date.now()}-${Math.floor(
        Math.random() * 10000
      )
        .toString()
        .padStart(4, "0")}`;

    /**
     * Create User + Patient together
     */
    const user = await prisma.$transaction(
      async (tx) => {
        const createdUser =
          await tx.user.create({
            data: {
              email: data.email,
              phoneNumber: data.phoneNumber,
              passwordHash: hashedPassword,
              roleId: patientRole.id,
              hospitalId:
                data.hospitalId ?? null,

              patient: {
                create: {
                  uhid,

                  firstName:
                    data.firstName,

                  lastName:
                    data.lastName,

                  gender:
                    data.gender,

                  dateOfBirth:
                    data.dateOfBirth,

                  bloodGroup:
                    data.bloodGroup,

                  address:
                    data.address,

                  emergencyContactName:
                    data.emergencyContactName,

                  emergencyContactPhone:
                    data.emergencyContactPhone,
                },
              },
            },

            include: {
              role: true,
              patient: true,
            },
          });

        return createdUser;
      }
    );

    const payload = {
      userId: user.id,
      role: user.role.name,
      hospitalId: user.hospitalId,
    };

    const accessToken =
      generateAccessToken(payload);

    const refreshToken =
      generateRefreshToken(payload);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(
          Date.now() +
            7 * 24 * 60 * 60 * 1000
        ),
      },
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login
   */
  static async login(data: LoginDto) {
    const user =
      await prisma.user.findUnique({
        where: {
          email: data.email,
        },

        include: {
          role: true,
          patient: true,
          doctor: true,
          staff: true,
        },
      });

    if (!user) {
      throw AppError.unauthorized(
        "Invalid email or password."
      );
    }

    const validPassword =
      await comparePassword(
        data.password,
        user.passwordHash
      );

    if (!validPassword) {
      throw AppError.unauthorized(
        "Invalid email or password."
      );
    }

    if (user.status !== "ACTIVE") {
      throw AppError.forbidden(
        "Your account is not active."
      );
    }

    const payload = {
      userId: user.id,
      role: user.role.name,
      hospitalId: user.hospitalId,
    };

    const accessToken =
      generateAccessToken(payload);

    const refreshToken =
      generateRefreshToken(payload);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(
          Date.now() +
            7 * 24 * 60 * 60 * 1000
        ),
      },
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh Access Token
   */
  static async refreshToken(
    data: RefreshTokenDto
  ) {
    const session =
      await prisma.session.findUnique({
        where: {
          refreshToken:
            data.refreshToken,
        },

        include: {
          user: {
            include: {
              role: true,
            },
          },
        },
      });

    if (!session) {
      throw AppError.unauthorized(
        "Invalid refresh token."
      );
    }

    if (
      session.expiresAt <= new Date()
    ) {
      await prisma.session.delete({
        where: {
          id: session.id,
        },
      });

      throw AppError.unauthorized(
        "Refresh token has expired."
      );
    }

    if (
      session.user.status !== "ACTIVE"
    ) {
      throw AppError.forbidden(
        "Your account is not active."
      );
    }

    const payload = {
      userId: session.user.id,
      role: session.user.role.name,
      hospitalId:
        session.user.hospitalId,
    };

    const accessToken =
      generateAccessToken(payload);

    const newRefreshToken =
      generateRefreshToken(payload);

    /**
     * Rotate refresh token
     */
    await prisma.session.update({
      where: {
        id: session.id,
      },

      data: {
        refreshToken:
          newRefreshToken,

        expiresAt: new Date(
          Date.now() +
            7 * 24 * 60 * 60 * 1000
        ),
      },
    });

    return {
      accessToken,
      refreshToken:
        newRefreshToken,
    };
  }

  /**
   * Logout
   */
  static async logout(
    data: LogoutDto
  ) {
    if (!data.refreshToken) {
      return true;
    }

    await prisma.session.deleteMany({
      where: {
        refreshToken:
          data.refreshToken,
      },
    });

    return true;
  }

  /**
   * Current Logged In User
   */
  static async getCurrentUser(
    userId: string
  ) {
    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },

        include: {
          role: true,
          patient: true,
          doctor: true,
          staff: true,
        },
      });

    if (!user) {
      throw AppError.notFound(
        "User not found."
      );
    }

    return user;
  }
}
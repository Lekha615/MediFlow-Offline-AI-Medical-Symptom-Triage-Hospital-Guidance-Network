import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  LogoutDto,
} from "../validators/auth.validator";

export class AuthController {
  /**
   * Patient Self Registration
   * POST /api/auth/register
   */
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = req.body as RegisterDto;

      const result = await AuthService.register(data);

      return res.status(201).json({
        success: true,
        message: "Registration successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login
   * POST /api/auth/login
   */
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = req.body as LoginDto;

      const result = await AuthService.login(data);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh Token
   * POST /api/auth/refresh
   */
  static async refresh(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = req.body as RefreshTokenDto;

      const result = await AuthService.refreshToken(data);

      return res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout
   * POST /api/auth/logout
   */
  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = req.body as LogoutDto;

      await AuthService.logout(data);

      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Current User
   * GET /api/auth/me
   */
  static async me(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId =
        (req as AuthenticatedRequest).user!.userId;

      const user =
        await AuthService.getCurrentUser(userId);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
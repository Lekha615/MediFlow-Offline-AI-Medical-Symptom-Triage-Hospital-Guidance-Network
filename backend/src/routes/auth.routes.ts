import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { authRateLimiter } from "../middlewares/rate-limit.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from "../validators/auth.validator";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  AuthController.register
);

router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  AuthController.login
);

router.post(
  "/refresh",
  authRateLimiter,
  validate(refreshTokenSchema),
  AuthController.refresh
);

router.post(
  "/logout",
  authRateLimiter,
  validate(logoutSchema),
  AuthController.logout
);

router.get("/me", authenticate, AuthController.me);

export default router;

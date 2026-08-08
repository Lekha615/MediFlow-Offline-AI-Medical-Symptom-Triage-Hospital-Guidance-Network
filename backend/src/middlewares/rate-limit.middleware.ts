import rateLimit from "express-rate-limit";

/**
 * Throttles sensitive authentication endpoints (register/login/refresh/logout)
 * to slow down credential-stuffing and brute-force attempts.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

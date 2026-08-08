import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  userId: string;
  role: string;
  hospitalId: string | null;
}

export const generateAccessToken = (
  payload: JwtPayload
) => {
  return jwt.sign(
    payload,
    env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

export const generateRefreshToken = (
  payload: JwtPayload
) => {
  return jwt.sign(
    payload,
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const verifyAccessToken = (
  token: string
) => {
  return jwt.verify(
    token,
    env.JWT_SECRET
  ) as JwtPayload;
};

export const verifyRefreshToken = (
  token: string
) => {
  return jwt.verify(
    token,
    env.JWT_REFRESH_SECRET
  ) as JwtPayload;
};
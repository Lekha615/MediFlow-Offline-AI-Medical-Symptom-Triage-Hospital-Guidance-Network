import crypto from "crypto";
import { prisma } from "../config/db";
import { AUTH_CONFIG } from "../config/auth.config";

/**
 * Generates a Unique Health ID candidate, e.g. "MF-LX3F9A2-8B1C7D4E".
 * Time component + random component keeps collisions vanishingly rare.
 */
const generateCandidate = (): string => {
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${AUTH_CONFIG.UHID_PREFIX}-${timePart}-${randomPart}`;
};

/**
 * Generates a UHID guaranteed (with overwhelming probability, and verified
 * against the database) to be unique at the time of generation.
 */
export const generateUniqueUHID = async (): Promise<string> => {
  const MAX_ATTEMPTS = 5;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = generateCandidate();

    const existing = await prisma.patient.findUnique({
      where: { uhid: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Failed to generate a unique UHID. Please retry.");
};

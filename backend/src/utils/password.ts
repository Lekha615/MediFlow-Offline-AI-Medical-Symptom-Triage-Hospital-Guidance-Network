import bcrypt from "bcryptjs";

/**
 * Hash a plain text password.
 */
export const hashPassword = async (
  password: string
): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare plain password with hashed password.
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
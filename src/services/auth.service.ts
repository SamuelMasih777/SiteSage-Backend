import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import CustomError from "../utils/customError";
import constants from "../utils/constants";

class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
  private readonly JWT_EXPIRES_IN = "7d";

  async hashPassword(password: string): Promise<string> {
    try {
      const hash = await bcrypt.hash(password, this.SALT_ROUNDS);
      return hash;
    } catch (error: any) {
      throw new CustomError(
        "Failed to hash password",
        constants.httpStatus.serverError
      );
    }
  }

  async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    } catch (error: any) {
      throw new CustomError(
        "Failed to verify password",
        constants.httpStatus.serverError
      );
    }
  }

  generateToken(userId: string, email: string): string {
    try {
      const token = jwt.sign({ userId, email }, this.JWT_SECRET, {
        expiresIn: this.JWT_EXPIRES_IN,
      });
      return token;
    } catch (error: any) {
      throw new CustomError(
        "Failed to generate token",
        constants.httpStatus.serverError
      );
    }
  }

  verifyToken(token: string): { userId: string; email: string } {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as {
        userId: string;
        email: string;
      };
      return decoded;
    } catch (error: any) {
      throw new CustomError(
        "Invalid or expired token",
        constants.httpStatus.unauthorized
      );
    }
  }
}

export default new AuthService();

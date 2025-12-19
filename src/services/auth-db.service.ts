import prisma from "../db/prisma";
import authService from "../services/auth.service";
import CustomError from "../utils/customError";
import constants from "../utils/constants";
import { UserCreateInput, AuthResponse } from "../models/user.model";

class AuthServiceDB {
  async signup(input: UserCreateInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new CustomError(
        "Invalid email format",
        constants.httpStatus.badRequest
      );
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existingUser) {
      throw new CustomError(
        "User with this email already exists",
        constants.httpStatus.conflict
      );
    }

    // Hash password
    const passwordHash = await authService.hashPassword(password);

    // Create user
    try {
      const user = await prisma.users.create({
        data: {
          email,
          password_hash: passwordHash
        },
        select: {
          id: true,
          email: true
        }
      });

      // Generate token
      const token = authService.generateToken(user.id, user.email);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch (error: any) {
      throw new CustomError(
        "Failed to create user",
        constants.httpStatus.serverError
      );
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user
    const user = await prisma.users.findUnique({
      where: { email },
      select: { id: true, email: true, password_hash: true }
    });

    if (!user) {
      throw new CustomError(
        "Invalid email or password",
        constants.httpStatus.unauthorized
      );
    }

    // Verify password
    const isValidPassword = await authService.comparePassword(
      password,
      user.password_hash
    );

    if (!isValidPassword) {
      throw new CustomError(
        "Invalid email or password",
        constants.httpStatus.unauthorized
      );
    }

    // Generate token
    const token = authService.generateToken(user.id, user.email);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}

export default new AuthServiceDB();

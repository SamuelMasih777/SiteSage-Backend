import pool from "../db/config";
import { v4 as uuidv4 } from "uuid";
import authService from "../services/auth.service";
import CustomError from "../utils/customError";
import constants from "../utils/constants";
import { User, UserCreateInput, AuthResponse } from "../models/user.model";

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
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new CustomError(
        "User with this email already exists",
        constants.httpStatus.conflict
      );
    }

    // Hash password
    const passwordHash = await authService.hashPassword(password);

    // Create user
    const userId = uuidv4();
    const result = await pool.query(
      "INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email",
      [userId, email, passwordHash]
    );

    const user = result.rows[0];

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

  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user
    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      throw new CustomError(
        "Invalid email or password",
        constants.httpStatus.unauthorized
      );
    }

    const user = result.rows[0];

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

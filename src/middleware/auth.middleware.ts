import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";
import CustomError from "../utils/customError";
import constants from "../utils/constants";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new CustomError(
        "No token provided",
        constants.httpStatus.unauthorized
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new CustomError(
        "Invalid token format",
        constants.httpStatus.unauthorized
      );
    }

    const decoded = authService.verifyToken(token);
    req.user = decoded;

    next();
  } catch (error: any) {
    const status = error.status || constants.httpStatus.unauthorized;
    const message = error.message || "Authentication failed";
    res.status(status).json({ status, message });
  }
};

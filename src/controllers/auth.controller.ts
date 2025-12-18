import Result from "../utils/result";
import authServiceDB from "../services/auth-db.service";
import constants from "../utils/constants";
import logger from "../utils/logger";
import { UserCreateInput, UserLoginInput } from "../models/user.model";

class AuthController {
  async signup(input: UserCreateInput) {
    const res = new Result();
    try {
      const data = await authServiceDB.signup(input);
      res.status = constants.httpStatus.success;
      res.data = data;
      res.message = "User registered successfully";
    } catch (error: any) {
      logger.error("Error in signup", { error: error.message, stack: error.stack });
      res.status = error.status || constants.httpStatus.serverError;
      res.message = error.message || "Internal server error";
    }
    return res;
  }

  async login(input: UserLoginInput) {
    const res = new Result();
    try {
      const data = await authServiceDB.login(input.email, input.password);
      res.status = constants.httpStatus.success;
      res.data = data;
      res.message = "Login successful";
    } catch (error: any) {
      logger.error("Error in login", { error: error.message, stack: error.stack });
      res.status = error.status || constants.httpStatus.serverError;
      res.message = error.message || "Internal server error";
    }
    return res;
  }
}

export default new AuthController();

import axios from "axios";
import CustomError from "./customError";
import constants from "./constants";

class UrlValidator {
  validateFormat(url: string): void {
    try {
      const urlObj = new URL(url);
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch (error) {
      throw new CustomError(
        `Invalid URL format: ${url}`,
        constants.httpStatus.badRequest
      );
    }
  }

  async checkAccessibility(url: string): Promise<void> {
    try {
      await axios.head(url, {
        timeout: 5000,
        validateStatus: (status) => status < 500, // Accept any status < 500
      });
    } catch (error: any) {
      if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
        throw new CustomError(
          `URL is not accessible: ${url}`,
          constants.httpStatus.badRequest
        );
      }
      // If it's a timeout or other network error, we'll still try to crawl
    }
  }

  async validate(url: string): Promise<void> {
    this.validateFormat(url);
    await this.checkAccessibility(url);
  }

  validateBatch(urls: string[]): void {
    if (!Array.isArray(urls) || urls.length === 0) {
      throw new CustomError(
        "URLs array is required and must not be empty",
        constants.httpStatus.badRequest
      );
    }

    if (urls.length > 10) {
      throw new CustomError(
        "Maximum 10 URLs allowed per request",
        constants.httpStatus.badRequest
      );
    }

    urls.forEach((url) => this.validateFormat(url));
  }
}

export default new UrlValidator();

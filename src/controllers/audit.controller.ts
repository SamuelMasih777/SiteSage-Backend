import Result from "../utils/result";
import constants from "../utils/constants";
import urlValidator from "../utils/url-validator";
import auditService from "../services/audit.service";
import dbQueries from "../db/queries";
import logger from "../utils/logger";
import { CreateAuditRequest } from "../models/audit.model";

class AuditController {
  async createAudit(userId: string, input: CreateAuditRequest) {
    const res = new Result();
    try {
      // Validate request
      if (!input.crawlerMode || !["standard", "js"].includes(input.crawlerMode)) {
        res.status = constants.httpStatus.badRequest;
        res.message = "crawlerMode is required and must be 'standard' or 'js'";
        return res;
      }

      // Validate URLs
      urlValidator.validateBatch(input.urls);

      // Process each URL
      const results = [];
      for (const url of input.urls) {
        try {
          const auditResult = await auditService.processAudit(
            userId,
            url,
            input.crawlerMode,
            input.generatePdf || false,
            input.customPrompt
          );
          results.push(auditResult);
        } catch (error: any) {
          logger.error(`Error processing ${url}`, { error: error.message, stack: error.stack, url });
          results.push({
            url,
            status: "failed",
            errorMessage: error.message,
          });
        }
      }

      res.status = constants.httpStatus.success;
      res.data = results;
      res.message = "Audits completed successfully";
    } catch (error: any) {
      logger.error("Error in createAudit", { error: error.message, stack: error.stack });
      res.status = error.status || constants.httpStatus.serverError;
      res.message = error.message || "Internal server error";
    }
    return res;
  }

  async getAuditById(userId: string, auditId: string) {
    const res = new Result();
    try {
      const audit = await dbQueries.getAuditById(auditId, userId);
      res.status = constants.httpStatus.success;
      res.data = audit;
    } catch (error: any) {
      logger.error("Error in getAuditById", { error: error.message, stack: error.stack, auditId });
      res.status = error.status || constants.httpStatus.serverError;
      res.message = error.message || "Internal server error";
    }
    return res;
  }

  async getUserAudits(userId: string, limit = 10, offset = 0) {
    const res = new Result();
    try {
      const audits = await dbQueries.getUserAudits(userId, limit, offset);
      res.status = constants.httpStatus.success;
      res.data = audits;
    } catch (error: any) {
      logger.error("Error in getUserAudits", { error: error.message, stack: error.stack, userId, limit, offset });
      res.status = error.status || constants.httpStatus.serverError;
      res.message = error.message || "Internal server error";
    }
    return res;
  }
}

export default new AuditController();

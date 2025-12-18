import pool from "./config";
import { v4 as uuidv4 } from "uuid";
import CustomError from "../utils/customError";
import constants from "../utils/constants";

class DatabaseQueries {
  // ========== AUDIT QUERIES ==========
  async createAudit(userId: string, url: string): Promise<string> {
    try {
      const auditId = uuidv4();
      await pool.query(
        "INSERT INTO audits (id, user_id, url, status) VALUES ($1, $2, $3, $4)",
        [auditId, userId, url, "pending"]
      );
      return auditId;
    } catch (error: any) {
      throw new CustomError(
        "Failed to create audit",
        constants.httpStatus.serverError
      );
    }
  }

  async updateAuditStatus(
    auditId: string,
    status: "pending" | "completed" | "failed",
    errorMessage?: string
  ): Promise<void> {
    try {
      await pool.query(
        "UPDATE audits SET status = $1, error_message = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
        [status, errorMessage || null, auditId]
      );
    } catch (error: any) {
      throw new CustomError(
        "Failed to update audit status",
        constants.httpStatus.serverError
      );
    }
  }

  async getAuditById(auditId: string, userId: string): Promise<any> {
    try {
      const result = await pool.query(
        `SELECT a.*, 
                sm.title, sm.meta_description, sm.h1_tags, sm.h2_tags, 
                sm.images_total, sm.images_without_alt, sm.internal_links, 
                sm.external_links, sm.page_load_time_ms, sm.seo_score, sm.issues,
                ai.summary, ai.suggestions,
                r.pdf_url
         FROM audits a
         LEFT JOIN seo_metrics sm ON a.id = sm.audit_id
         LEFT JOIN ai_insights ai ON a.id = ai.audit_id
         LEFT JOIN reports r ON a.id = r.audit_id
         WHERE a.id = $1 AND a.user_id = $2`,
        [auditId, userId]
      );

      if (result.rows.length === 0) {
        throw new CustomError(
          "Audit not found",
          constants.httpStatus.notFound
        );
      }

      return result.rows[0];
    } catch (error: any) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        "Failed to fetch audit",
        constants.httpStatus.serverError
      );
    }
  }

  async getUserAudits(userId: string, limit = 10, offset = 0): Promise<any[]> {
    try {
      const result = await pool.query(
        `SELECT a.id, a.url, a.status, a.created_at, sm.seo_score
         FROM audits a
         LEFT JOIN seo_metrics sm ON a.id = sm.audit_id
         WHERE a.user_id = $1
         ORDER BY a.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      return result.rows;
    } catch (error: any) {
      throw new CustomError(
        "Failed to fetch audits",
        constants.httpStatus.serverError
      );
    }
  }

  // ========== SEO METRICS QUERIES ==========
  async saveSeoMetrics(auditId: string, metrics: any): Promise<void> {
    try {
      const metricsId = uuidv4();
      await pool.query(
        `INSERT INTO seo_metrics (
          id, audit_id, title, meta_description, h1_tags, h2_tags,
          images_total, images_without_alt, internal_links, external_links,
          page_load_time_ms, seo_score, issues
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          metricsId,
          auditId,
          metrics.title,
          metrics.metaDescription,
          JSON.stringify(metrics.h1Tags),
          JSON.stringify(metrics.h2Tags),
          metrics.imagesTotal,
          metrics.imagesWithoutAlt,
          metrics.internalLinks,
          metrics.externalLinks,
          metrics.pageLoadTimeMs,
          metrics.seoScore,
          JSON.stringify(metrics.issues),
        ]
      );
    } catch (error: any) {
      throw new CustomError(
        "Failed to save SEO metrics",
        constants.httpStatus.serverError
      );
    }
  }

  // ========== AI INSIGHTS QUERIES ==========
  async saveAiInsights(
    auditId: string,
    summary: string,
    suggestions: string[]
  ): Promise<void> {
    try {
      const insightId = uuidv4();
      await pool.query(
        "INSERT INTO ai_insights (id, audit_id, summary, suggestions) VALUES ($1, $2, $3, $4)",
        [insightId, auditId, summary, JSON.stringify(suggestions)]
      );
    } catch (error: any) {
      throw new CustomError(
        "Failed to save AI insights",
        constants.httpStatus.serverError
      );
    }
  }

  // ========== REPORT QUERIES ==========
  async saveReport(auditId: string, pdfUrl: string): Promise<void> {
    try {
      const reportId = uuidv4();
      await pool.query(
        "INSERT INTO reports (id, audit_id, pdf_url) VALUES ($1, $2, $3)",
        [reportId, auditId, pdfUrl]
      );
    } catch (error: any) {
      throw new CustomError(
        "Failed to save report",
        constants.httpStatus.serverError
      );
    }
  }
}

export default new DatabaseQueries();

import prisma from "./prisma";
import CustomError from "../utils/customError";
import constants from "../utils/constants";

class DatabaseQueries {
  // ========== AUDIT QUERIES ==========
  async createAudit(userId: string, url: string): Promise<string> {
    try {
      const audit = await prisma.audits.create({
        data: {
          user_id: userId,
          url: url,
          status: "pending",
        },
        select: { id: true },
      });
      return audit.id;
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
      await prisma.audits.update({
        where: { id: auditId },
        data: {
          status: status,
          error_message: errorMessage || null,
          updated_at: new Date(),
        },
      });
    } catch (error: any) {
      throw new CustomError(
        "Failed to update audit status",
        constants.httpStatus.serverError
      );
    }
  }

  async getAuditById(auditId: string, userId: string): Promise<any> {
    try {
      const audit = await prisma.audits.findFirst({
        where: {
          id: auditId,
          user_id: userId,
        },
        include: {
          seo_metric: true,
          ai_insight: true,
          report: true,
        },
      });

      if (!audit) {
        throw new CustomError(
          "Audit not found",
          constants.httpStatus.notFound
        );
      }

      // Flatten structure and convert to camelCase
      return {
        id: audit.id,
        url: audit.url,
        status: audit.status,
        created_at: audit.created_at,
        seoScore: audit.seo_metric?.seo_score || null,
        title: audit.seo_metric?.title || null,
        metaDescription: audit.seo_metric?.meta_description || null,
        h1Tags: audit.seo_metric?.h1_tags || [],
        h2Tags: audit.seo_metric?.h2_tags || [],
        imagesTotal: audit.seo_metric?.images_total || 0,
        imagesWithoutAlt: audit.seo_metric?.images_without_alt || 0,
        internalLinks: audit.seo_metric?.internal_links || 0,
        externalLinks: audit.seo_metric?.external_links || 0,
        pageLoadTimeMs: audit.seo_metric?.page_load_time_ms || null,
        issues: audit.seo_metric?.issues || [],
        summary: audit.ai_insight?.summary || null,
        suggestions: audit.ai_insight?.suggestions || [],
        pdfUrl: audit.report?.pdf_url || null,
      };
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
      const audits = await prisma.audits.findMany({
        where: { user_id: userId },
        include: {
          seo_metric: true,
          ai_insight: true,
          report: true,
        },
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
      });

      // Map to desired structure with camelCase
      return audits.map((audit: any) => ({
        id: audit.id,
        url: audit.url,
        status: audit.status,
        created_at: audit.created_at,
        seoScore: audit.seo_metric?.seo_score || null,
        title: audit.seo_metric?.title || null,
        metaDescription: audit.seo_metric?.meta_description || null,
        h1Tags: audit.seo_metric?.h1_tags || [],
        h2Tags: audit.seo_metric?.h2_tags || [],
        imagesTotal: audit.seo_metric?.images_total || 0,
        imagesWithoutAlt: audit.seo_metric?.images_without_alt || 0,
        internalLinks: audit.seo_metric?.internal_links || 0,
        externalLinks: audit.seo_metric?.external_links || 0,
        pageLoadTimeMs: audit.seo_metric?.page_load_time_ms || null,
        issues: audit.seo_metric?.issues || [],
        summary: audit.ai_insight?.summary || null,
        suggestions: audit.ai_insight?.suggestions || [],
        pdfUrl: audit.report?.pdf_url || null,
      }));
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
      await prisma.seo_metrics.create({
        data: {
          audit_id: auditId,
          title: metrics.title,
          meta_description: metrics.metaDescription,
          h1_tags: metrics.h1Tags,
          h2_tags: metrics.h2Tags,
          images_total: metrics.imagesTotal,
          images_without_alt: metrics.imagesWithoutAlt,
          internal_links: metrics.internalLinks,
          external_links: metrics.externalLinks,
          page_load_time_ms: metrics.pageLoadTimeMs,
          seo_score: metrics.seoScore,
          issues: metrics.issues,
        },
      });
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
      await prisma.ai_insights.create({
        data: {
          audit_id: auditId,
          summary: summary,
          suggestions: suggestions,
        },
      });
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
      await prisma.reports.create({
        data: {
          audit_id: auditId,
          pdf_url: pdfUrl,
        },
      });
    } catch (error: any) {
      throw new CustomError(
        "Failed to save report",
        constants.httpStatus.serverError
      );
    }
  }
}

export default new DatabaseQueries();

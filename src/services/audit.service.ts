import crawlerService from "./crawler.service";
import seoAnalyzerService from "./seo-analyzer.service";
import aiInsightsService from "./ai-insights.service";
import pdfGeneratorService from "./pdf-generator.service";
import dbQueries from "../db/queries";
import CustomError from "../utils/customError";
import constants from "../utils/constants";
import logger from "../utils/logger";

class AuditService {
  async processAudit(
    userId: string,
    url: string,
    crawlerMode: "standard" | "js",
    generatePdf: boolean,
    customPrompt?: string
  ): Promise<any> {
    let auditId: string | null = null;

    try {
      // Step 1: Create audit record
      auditId = await dbQueries.createAudit(userId, url);

      // Step 2: Extract - Crawl the URL
      const crawlData = await crawlerService.crawl(url, crawlerMode);

      // Step 3: Analyze - Run SEO analysis
      const seoAnalysis = seoAnalyzerService.analyze(crawlData);

      // Step 4: Store - Save SEO metrics
      await dbQueries.saveSeoMetrics(auditId, {
        title: crawlData.title,
        metaDescription: crawlData.metaDescription,
        h1Tags: crawlData.h1Tags,
        h2Tags: crawlData.h2Tags,
        imagesTotal: crawlData.imagesTotal,
        imagesWithoutAlt: crawlData.imagesWithoutAlt,
        internalLinks: crawlData.internalLinks,
        externalLinks: crawlData.externalLinks,
        pageLoadTimeMs: crawlData.pageLoadTimeMs,
        seoScore: seoAnalysis.seoScore,
        issues: seoAnalysis.issues,
      });

      // Step 5: AI Insights - Generate recommendations
      let aiInsights;
      try {
        aiInsights = await aiInsightsService.generateInsights(
          url,
          seoAnalysis.seoScore,
          crawlData.title,
          crawlData.metaDescription,
          seoAnalysis.issues,
          customPrompt
        );
        await dbQueries.saveAiInsights(
          auditId,
          aiInsights.summary,
          aiInsights.suggestions
        );
      } catch (aiError: any) {
        logger.warn("AI insights failed, using fallback", { error: aiError.message, stack: aiError.stack, url });
        aiInsights = {
          summary: "AI insights temporarily unavailable",
          suggestions: seoAnalysis.issues.slice(0, 3).map((issue) => `Fix: ${issue}`),
        };
      }

      // Step 6: PDF Generation (optional)
      let pdfUrl = null;
      if (generatePdf) {
        try {
          pdfUrl = await pdfGeneratorService.generateReport({
            auditId,
            url,
            seoScore: seoAnalysis.seoScore,
            title: crawlData.title,
            metaDescription: crawlData.metaDescription,
            h1Tags: crawlData.h1Tags,
            h2Tags: crawlData.h2Tags,
            imagesTotal: crawlData.imagesTotal,
            imagesWithoutAlt: crawlData.imagesWithoutAlt,
            internalLinks: crawlData.internalLinks,
            externalLinks: crawlData.externalLinks,
            pageLoadTimeMs: crawlData.pageLoadTimeMs,
            issues: seoAnalysis.issues,
            summary: aiInsights.summary,
            suggestions: aiInsights.suggestions,
          });
          await dbQueries.saveReport(auditId, pdfUrl);
        } catch (pdfError: any) {
          logger.warn("PDF generation failed", { error: pdfError.message, stack: pdfError.stack, auditId });
          // Continue without PDF
        }
      }

      // Step 7: Update audit status to completed
      await dbQueries.updateAuditStatus(auditId, "completed");

      // Step 8: Return structured response
      return {
        id: auditId,
        url,
        status: "completed",
        seoScore: seoAnalysis.seoScore,
        title: crawlData.title,
        metaDescription: crawlData.metaDescription,
        h1Tags: crawlData.h1Tags,
        h2Tags: crawlData.h2Tags,
        imagesTotal: crawlData.imagesTotal,
        imagesWithoutAlt: crawlData.imagesWithoutAlt,
        internalLinks: crawlData.internalLinks,
        externalLinks: crawlData.externalLinks,
        pageLoadTimeMs: crawlData.pageLoadTimeMs,
        issues: seoAnalysis.issues,
        summary: aiInsights.summary,
        suggestions: aiInsights.suggestions,
        pdfUrl,
      };
    } catch (error: any) {
      // Mark audit as failed
      if (auditId) {
        await dbQueries.updateAuditStatus(auditId, "failed", error.message);
      }

      logger.error("Audit processing failed", { error: error.message, stack: error.stack, url, auditId });

      throw new CustomError(
        error.message || "Audit processing failed",
        error.status || constants.httpStatus.serverError
      );
    }
  }
}

export default new AuditService();

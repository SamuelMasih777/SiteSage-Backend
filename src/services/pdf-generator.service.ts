import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import CustomError from "../utils/customError";
import constants from "../utils/constants";

class PdfGeneratorService {
  private reportsDir = path.join(process.cwd(), "reports");

  constructor() {
    // Ensure reports directory exists
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async generateReport(auditData: any): Promise<string> {
    try {
      const filename = `${auditData.auditId}.pdf`;
      const filepath = path.join(this.reportsDir, filename);

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filepath);

        stream.on("finish", () => {
          resolve(`/reports/${filename}`);
        });

        stream.on("error", (error) => {
          reject(error);
        });

        doc.pipe(stream);

        // Header
        doc
          .fontSize(24)
          .fillColor("#2563eb")
          .text("SiteSage SEO Report", { align: "center" });

        doc.moveDown();
        doc
          .fontSize(10)
          .fillColor("#6b7280")
          .text(`Generated: ${new Date().toLocaleString()}`, {
            align: "center",
          });

        doc.moveDown(2);

        // URL and Score
        doc.fontSize(12).fillColor("#000000").text(`URL: ${auditData.url}`);
        doc.moveDown(0.5);

        const scoreColor = this.getScoreColor(auditData.seoScore);
        doc
          .fontSize(16)
          .fillColor(scoreColor)
          .text(`SEO Score: ${auditData.seoScore}/100`);

        doc.moveDown(2);

        // Summary Section
        if (auditData.summary) {
          doc
            .fontSize(14)
            .fillColor("#1f2937")
            .text("Summary", { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(10).fillColor("#374151").text(auditData.summary);
          doc.moveDown(2);
        }

        // Metrics Section
        doc
          .fontSize(14)
          .fillColor("#1f2937")
          .text("SEO Metrics", { underline: true });
        doc.moveDown(0.5);

        const metrics = [
          { label: "Title", value: auditData.title || "Not found" },
          {
            label: "Meta Description",
            value: auditData.metaDescription || "Not found",
          },
          { label: "H1 Tags", value: auditData.h1Tags?.length || 0 },
          { label: "H2 Tags", value: auditData.h2Tags?.length || 0 },
          { label: "Total Images", value: auditData.imagesTotal || 0 },
          {
            label: "Images Without Alt",
            value: auditData.imagesWithoutAlt || 0,
          },
          { label: "Internal Links", value: auditData.internalLinks || 0 },
          { label: "External Links", value: auditData.externalLinks || 0 },
          {
            label: "Page Load Time",
            value: `${auditData.pageLoadTimeMs || 0}ms`,
          },
        ];

        metrics.forEach((metric) => {
          doc
            .fontSize(10)
            .fillColor("#000000")
            .text(`${metric.label}: `, { continued: true })
            .fillColor("#6b7280")
            .text(`${metric.value}`);
        });

        doc.moveDown(2);

        // Issues Section
        if (auditData.issues && auditData.issues.length > 0) {
          doc
            .fontSize(14)
            .fillColor("#1f2937")
            .text("Issues Found", { underline: true });
          doc.moveDown(0.5);

          auditData.issues.forEach((issue: string, index: number) => {
            doc
              .fontSize(10)
              .fillColor("#dc2626")
              .text(`${index + 1}. ${issue}`);
          });

          doc.moveDown(2);
        }

        // Suggestions Section
        if (auditData.suggestions && auditData.suggestions.length > 0) {
          doc
            .fontSize(14)
            .fillColor("#1f2937")
            .text("Recommendations", { underline: true });
          doc.moveDown(0.5);

          auditData.suggestions.forEach((suggestion: string, index: number) => {
            doc
              .fontSize(10)
              .fillColor("#059669")
              .text(`${index + 1}. ${suggestion}`);
          });
        }

        // Footer
        doc
          .moveDown(3)
          .fontSize(8)
          .fillColor("#9ca3af")
          .text("Powered by SiteSage", { align: "center" });

        doc.end();
      });
    } catch (error: any) {
      throw new CustomError(
        "Failed to generate PDF report",
        constants.httpStatus.serverError
      );
    }
  }

  private getScoreColor(score: number): string {
    if (score >= 80) return "#059669"; // Green
    if (score >= 60) return "#d97706"; // Orange
    return "#dc2626"; // Red
  }
}

export default new PdfGeneratorService();

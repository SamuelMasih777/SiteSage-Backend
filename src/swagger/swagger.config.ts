import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SiteSage API",
      version: "1.0.0",
      description: "Automated SEO Performance Analyzer API",
      contact: {
        name: "SiteSage Team",
      },
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:4000",
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            status: { type: "number" },
            message: { type: "string" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            status: { type: "number" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                token: { type: "string" },
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    email: { type: "string" },
                  },
                },
              },
            },
          },
        },
        AuditRequest: {
          type: "object",
          required: ["urls", "crawlerMode"],
          properties: {
            urls: {
              type: "array",
              items: { type: "string" },
              example: ["https://example.com"],
            },
            crawlerMode: {
              type: "string",
              enum: ["standard", "js"],
              example: "standard",
            },
            generatePdf: {
              type: "boolean",
              example: false,
            },
            customPrompt: {
              type: "string",
              example: "Focus on mobile SEO issues",
            },
          },
        },
        AuditResponse: {
          type: "object",
          properties: {
            id: { type: "string" },
            url: { type: "string" },
            status: { type: "string", enum: ["pending", "completed", "failed"] },
            seoScore: { type: "number" },
            title: { type: "string" },
            metaDescription: { type: "string" },
            h1Tags: { type: "array", items: { type: "string" } },
            h2Tags: { type: "array", items: { type: "string" } },
            imagesTotal: { type: "number" },
            imagesWithoutAlt: { type: "number" },
            internalLinks: { type: "number" },
            externalLinks: { type: "number" },
            pageLoadTimeMs: { type: "number" },
            issues: { type: "array", items: { type: "string" } },
            summary: { type: "string" },
            suggestions: { type: "array", items: { type: "string" } },
            pdfUrl: { type: "string" },
            errorMessage: { type: "string" },
          },
        },
      },
    },
    security: [],
  },
  // Use path.join to create an absolute path that works in both src (dev) and dist (prod)
  apis: [path.join(__dirname, "../routers/*.{ts,js}")],
};

export const swaggerSpec = swaggerJsdoc(options);

export interface CreateAuditRequest {
  urls: string[];
  crawlerMode: "standard" | "js";
  generatePdf?: boolean;
  customPrompt?: string;
}

export interface AuditResponse {
  id: string;
  url: string;
  status: "pending" | "completed" | "failed";
  seoScore?: number;
  title?: string;
  metaDescription?: string;
  h1Tags?: string[];
  h2Tags?: string[];
  imagesTotal?: number;
  imagesWithoutAlt?: number;
  internalLinks?: number;
  externalLinks?: number;
  pageLoadTimeMs?: number;
  issues?: string[];
  summary?: string;
  suggestions?: string[];
  pdfUrl?: string;
  errorMessage?: string;
  createdAt: Date;
}

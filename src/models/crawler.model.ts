export interface CrawlResult {
  url: string;
  title: string | null;
  metaDescription: string | null;
  h1Tags: string[];
  h2Tags: string[];
  images: ImageInfo[];
  imagesTotal: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  pageLoadTimeMs: number;
}

export interface ImageInfo {
  src: string;
  alt: string | null;
}

export type CrawlerMode = "standard" | "js";

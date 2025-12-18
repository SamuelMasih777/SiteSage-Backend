import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import CustomError from "../utils/customError";
import constants from "../utils/constants";
import { CrawlResult, CrawlerMode } from "../models/crawler.model";

class CrawlerService {
  async crawl(url: string, mode: CrawlerMode): Promise<CrawlResult> {
    try {
      if (mode === "standard") {
        return await this.crawlWithCheerio(url);
      } else {
        return await this.crawlWithPuppeteer(url);
      }
    } catch (error: any) {
      throw new CustomError(
        `Failed to crawl URL: ${error.message}`,
        constants.httpStatus.serverError
      );
    }
  }

  private async crawlWithCheerio(url: string): Promise<CrawlResult> {
    const startTime = Date.now();

    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      const pageLoadTimeMs = Date.now() - startTime;
      const html = response.data;
      const $ = cheerio.load(html);

      // Extract title
      const title = $("title").text().trim() || null;

      // Extract meta description
      const metaDescription =
        $('meta[name="description"]').attr("content")?.trim() || null;

      // Extract H1 tags
      const h1Tags: string[] = [];
      $("h1").each((_, el) => {
        const text = $(el).text().trim();
        if (text) h1Tags.push(text);
      });

      // Extract H2 tags
      const h2Tags: string[] = [];
      $("h2").each((_, el) => {
        const text = $(el).text().trim();
        if (text) h2Tags.push(text);
      });

      // Extract images
      const images: { src: string; alt: string | null }[] = [];
      let imagesWithoutAlt = 0;

      $("img").each((_, el) => {
        const src = $(el).attr("src") || "";
        const alt = $(el).attr("alt")?.trim() || null;

        if (src) {
          images.push({ src, alt });
          if (!alt) imagesWithoutAlt++;
        }
      });

      // Count links
      const urlObj = new URL(url);
      const baseHostname = urlObj.hostname;
      let internalLinks = 0;
      let externalLinks = 0;

      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (href) {
          try {
            const linkUrl = new URL(href, url);
            if (linkUrl.hostname === baseHostname) {
              internalLinks++;
            } else {
              externalLinks++;
            }
          } catch {
            // Relative link or invalid URL
            internalLinks++;
          }
        }
      });

      return {
        url,
        title,
        metaDescription,
        h1Tags,
        h2Tags,
        images,
        imagesTotal: images.length,
        imagesWithoutAlt,
        internalLinks,
        externalLinks,
        pageLoadTimeMs,
      };
    } catch (error: any) {
      if (error.code === "ENOTFOUND") {
        throw new CustomError(
          "URL not found or unreachable",
          constants.httpStatus.badRequest
        );
      }
      if (error.code === "ETIMEDOUT") {
        throw new CustomError(
          "Request timeout",
          constants.httpStatus.serverError
        );
      }
      throw error;
    }
  }

  private async crawlWithPuppeteer(url: string): Promise<CrawlResult> {
    const startTime = Date.now();
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      );

      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const pageLoadTimeMs = Date.now() - startTime;

      // Extract data using page.evaluate
      const data = await page.evaluate(() => {
        // Title
        const title = document.querySelector("title")?.textContent?.trim() || null;

        // Meta description
        const metaDesc = document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content")
          ?.trim() || null;

        // H1 tags
        const h1Elements = Array.from(document.querySelectorAll("h1"));
        const h1Tags = h1Elements
          .map((el) => el.textContent?.trim())
          .filter((text) => text) as string[];

        // H2 tags
        const h2Elements = Array.from(document.querySelectorAll("h2"));
        const h2Tags = h2Elements
          .map((el) => el.textContent?.trim())
          .filter((text) => text) as string[];

        // Images
        const imgElements = Array.from(document.querySelectorAll("img"));
        const images = imgElements.map((img) => ({
          src: img.getAttribute("src") || "",
          alt: img.getAttribute("alt")?.trim() || null,
        }));

        const imagesWithoutAlt = images.filter((img) => !img.alt).length;

        // Links
        const baseHostname = window.location.hostname;
        const linkElements = Array.from(document.querySelectorAll("a[href]"));
        let internalLinks = 0;
        let externalLinks = 0;

        linkElements.forEach((link) => {
          const href = link.getAttribute("href");
          if (href) {
            try {
              const linkUrl = new URL(href, window.location.href);
              if (linkUrl.hostname === baseHostname) {
                internalLinks++;
              } else {
                externalLinks++;
              }
            } catch {
              internalLinks++;
            }
          }
        });

        return {
          title,
          metaDescription: metaDesc,
          h1Tags,
          h2Tags,
          images,
          imagesTotal: images.length,
          imagesWithoutAlt,
          internalLinks,
          externalLinks,
        };
      });

      await browser.close();

      return {
        url,
        ...data,
        pageLoadTimeMs,
      };
    } catch (error: any) {
      if (browser) await browser.close();

      if (error.name === "TimeoutError") {
        throw new CustomError(
          "Page load timeout",
          constants.httpStatus.serverError
        );
      }
      throw error;
    }
  }
}

export default new CrawlerService();

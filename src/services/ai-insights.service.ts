import { GoogleGenerativeAI } from "@google/generative-ai";
import CustomError from "../utils/customError";
import constants from "../utils/constants";
import logger from "../utils/logger";

class AiInsightsService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateInsights(
    url: string,
    seoScore: number,
    title: string | null,
    metaDescription: string | null,
    issues: string[],
    customPrompt?: string
  ): Promise<{ summary: string; suggestions: string[] }> {
    try {
      const prompt = this.buildPrompt(
        url,
        seoScore,
        title,
        metaDescription,
        issues,
        customPrompt
      );

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const parsed = this.parseResponse(text);
      return parsed;
    } catch (error: any) {
      logger.error("AI Insights generation failed", { error: error.message, stack: error.stack, url, seoScore });
      // Fallback to generic insights
      return this.getFallbackInsights(seoScore, issues);
    }
  }

  private buildPrompt(
    url: string,
    seoScore: number,
    title: string | null,
    metaDescription: string | null,
    issues: string[],
    customPrompt?: string
  ): string {
    const basePrompt = `You are an SEO expert analyzing a website. Based on the following data, provide:
1. A 2-3 paragraph summary of the website's SEO quality
2. 3-5 specific, actionable improvement suggestions

Website URL: ${url}
SEO Score: ${seoScore}/100
Title: ${title || "Not found"}
Meta Description: ${metaDescription || "Not found"}
Issues Found: ${issues.length > 0 ? issues.join(", ") : "None"}

${customPrompt ? `\nAdditional Instructions: ${customPrompt}\n` : ""}

Provide your response in JSON format:
{
  "summary": "...",
  "suggestions": ["...", "...", "..."]
}`;

    return basePrompt;
  }

  private parseResponse(text: string): {
    summary: string;
    suggestions: string[];
  } {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;

      const parsed = JSON.parse(jsonText);

      if (!parsed.summary || !Array.isArray(parsed.suggestions)) {
        throw new Error("Invalid response format");
      }

      return {
        summary: parsed.summary,
        suggestions: parsed.suggestions,
      };
    } catch (error) {
      throw new CustomError(
        "Failed to parse AI response",
        constants.httpStatus.serverError
      );
    }
  }

  private getFallbackInsights(
    seoScore: number,
    issues: string[]
  ): { summary: string; suggestions: string[] } {
    let summary = "";

    if (seoScore >= 80) {
      summary =
        "Your website demonstrates strong SEO fundamentals with a high overall score. The site is well-optimized for search engines with proper meta tags and content structure. Continue monitoring performance and staying updated with SEO best practices to maintain your rankings.";
    } else if (seoScore >= 60) {
      summary =
        "Your website has a decent SEO foundation but there's room for improvement. Several key areas need attention to boost search engine visibility. Addressing the identified issues will help improve your rankings and organic traffic.";
    } else {
      summary =
        "Your website needs significant SEO improvements. Multiple critical issues are affecting search engine visibility and user experience. Prioritize fixing the most impactful problems first, starting with meta tags and page performance.";
    }

    const suggestions = issues.slice(0, 5).map((issue) => `Fix: ${issue}`);

    if (suggestions.length === 0) {
      suggestions.push(
        "Continue monitoring your SEO performance regularly",
        "Keep content fresh and updated",
        "Build quality backlinks from reputable sources"
      );
    }

    return { summary, suggestions };
  }
}

export default new AiInsightsService();

import { SeoRule, RuleResult } from "../types";
import { CrawlResult } from "../../../models/crawler.model";

export const metaDescriptionRule: SeoRule = {
  name: "Meta Description",
  execute: (data: CrawlResult): RuleResult => {
    const issues: string[] = [];
    let score = 0;
    const maxScore = 15;

    if (!data.metaDescription) {
      issues.push("Missing meta description");
      return { score, maxScore, issues };
    }

    // Meta description exists: 10 points
    score += 10;

    // Optimal length (150-160 chars): 5 points
    const descLength = data.metaDescription.length;
    if (descLength >= 150 && descLength <= 160) {
      score += 5;
    } else if (descLength < 150) {
      issues.push(`Meta description is too short (${descLength} chars). Recommended: 150-160 chars`);
    } else if (descLength > 160) {
      issues.push(`Meta description is too long (${descLength} chars). Recommended: 150-160 chars`);
    }

    return { score, maxScore, issues };
  },
};

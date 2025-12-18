import { SeoRule, RuleResult } from "../types";
import { CrawlResult } from "../../models/crawler.model";

export const titleRule: SeoRule = {
  name: "Title Tag",
  execute: (data: CrawlResult): RuleResult => {
    const issues: string[] = [];
    let score = 0;
    const maxScore = 15;

    if (!data.title) {
      issues.push("Missing title tag");
      return { score, maxScore, issues };
    }

    // Title exists: 10 points
    score += 10;

    // Optimal length (50-60 chars): 5 points
    const titleLength = data.title.length;
    if (titleLength >= 50 && titleLength <= 60) {
      score += 5;
    } else if (titleLength < 50) {
      issues.push(`Title is too short (${titleLength} chars). Recommended: 50-60 chars`);
    } else if (titleLength > 60) {
      issues.push(`Title is too long (${titleLength} chars). Recommended: 50-60 chars`);
    }

    return { score, maxScore, issues };
  },
};

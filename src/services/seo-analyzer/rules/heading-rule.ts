import { SeoRule, RuleResult } from "../types";
import { CrawlResult } from "../../models/crawler.model";

export const headingRule: SeoRule = {
  name: "Heading Tags",
  execute: (data: CrawlResult): RuleResult => {
    const issues: string[] = [];
    let score = 0;
    const maxScore = 20;

    // H1 exists and unique: 15 points
    if (data.h1Tags.length === 0) {
      issues.push("Missing H1 tag");
    } else if (data.h1Tags.length === 1) {
      score += 15;
    } else {
      score += 10; // Partial credit for having H1, but not unique
      issues.push(`Multiple H1 tags found (${data.h1Tags.length}). Should have exactly one H1 tag`);
    }

    // H2 tags present: 5 points
    if (data.h2Tags.length > 0) {
      score += 5;
    } else {
      issues.push("No H2 tags found. Consider adding subheadings for better structure");
    }

    return { score, maxScore, issues };
  },
};

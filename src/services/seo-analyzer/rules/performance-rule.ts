import { SeoRule, RuleResult } from "../types";
import { CrawlResult } from "../../../models/crawler.model";

export const performanceRule: SeoRule = {
  name: "Page Performance",
  execute: (data: CrawlResult): RuleResult => {
    const issues: string[] = [];
    let score = 0;
    const maxScore = 35;

    const loadTimeSeconds = data.pageLoadTimeMs / 1000;

    // Excellent: < 2s = 35 points
    if (loadTimeSeconds < 2) {
      score = 35;
    }
    // Good: < 3s = 25 points
    else if (loadTimeSeconds < 3) {
      score = 25;
      issues.push(`Page load time is ${loadTimeSeconds.toFixed(2)}s. Aim for under 2s for optimal performance`);
    }
    // Fair: < 5s = 15 points
    else if (loadTimeSeconds < 5) {
      score = 15;
      issues.push(`Page load time is ${loadTimeSeconds.toFixed(2)}s. This may negatively impact user experience`);
    }
    // Poor: >= 5s = 5 points
    else {
      score = 5;
      issues.push(`Page load time is ${loadTimeSeconds.toFixed(2)}s. This is too slow and will hurt SEO rankings`);
    }

    return { score, maxScore, issues };
  },
};

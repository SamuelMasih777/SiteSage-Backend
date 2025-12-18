import { SeoRule, RuleResult } from "../types";
import { CrawlResult } from "../../models/crawler.model";

export const imageAltRule: SeoRule = {
  name: "Image Alt Tags",
  execute: (data: CrawlResult): RuleResult => {
    const issues: string[] = [];
    let score = 0;
    const maxScore = 15;

    if (data.imagesTotal === 0) {
      // No images, full score
      score = maxScore;
      return { score, maxScore, issues };
    }

    // Calculate percentage of images with alt tags
    const imagesWithAlt = data.imagesTotal - data.imagesWithoutAlt;
    const percentage = (imagesWithAlt / data.imagesTotal) * 100;

    // Score based on percentage
    if (percentage === 100) {
      score = maxScore;
    } else if (percentage >= 80) {
      score = 12;
      issues.push(`${data.imagesWithoutAlt} image(s) missing alt tags`);
    } else if (percentage >= 60) {
      score = 9;
      issues.push(`${data.imagesWithoutAlt} image(s) missing alt tags`);
    } else if (percentage >= 40) {
      score = 6;
      issues.push(`${data.imagesWithoutAlt} image(s) missing alt tags`);
    } else {
      score = 3;
      issues.push(`${data.imagesWithoutAlt} image(s) missing alt tags. This significantly impacts accessibility and SEO`);
    }

    return { score, maxScore, issues };
  },
};

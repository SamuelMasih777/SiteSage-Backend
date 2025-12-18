import { CrawlResult } from "../models/crawler.model";
import { SeoAnalysisResult, SeoRule } from "./seo-analyzer/types";
import { titleRule } from "./seo-analyzer/rules/title-rule";
import { metaDescriptionRule } from "./seo-analyzer/rules/meta-description-rule";
import { headingRule } from "./seo-analyzer/rules/heading-rule";
import { imageAltRule } from "./seo-analyzer/rules/image-alt-rule";
import { performanceRule } from "./seo-analyzer/rules/performance-rule";

class SeoAnalyzerService {
  private rules: SeoRule[] = [
    titleRule,
    metaDescriptionRule,
    headingRule,
    imageAltRule,
    performanceRule,
  ];

  analyze(crawlData: CrawlResult): SeoAnalysisResult {
    let totalScore = 0;
    let totalMaxScore = 0;
    const allIssues: string[] = [];
    const ruleResults: { [ruleName: string]: any } = {};

    // Execute all rules
    for (const rule of this.rules) {
      const result = rule.execute(crawlData);
      totalScore += result.score;
      totalMaxScore += result.maxScore;
      allIssues.push(...result.issues);
      ruleResults[rule.name] = result;
    }

    // Calculate final score as percentage (0-100)
    const seoScore = Math.round((totalScore / totalMaxScore) * 100);

    return {
      seoScore,
      maxScore: 100,
      issues: allIssues,
      ruleResults,
    };
  }
}

export default new SeoAnalyzerService();

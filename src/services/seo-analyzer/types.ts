import { CrawlResult } from "../../models/crawler.model";

export interface SeoRule {
  name: string;
  execute: (data: CrawlResult) => RuleResult;
}

export interface RuleResult {
  score: number;
  maxScore: number;
  issues: string[];
}

export interface SeoAnalysisResult {
  seoScore: number;
  maxScore: number;
  issues: string[];
  ruleResults: {
    [ruleName: string]: RuleResult;
  };
}

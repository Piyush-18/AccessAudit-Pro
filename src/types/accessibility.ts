export interface AccessibilityIssue {
  id: string;
  category: 'images' | 'forms' | 'navigation' | 'colors' | 'typography' | 'aria' | 'keyboard';
  severity: 'critical' | 'moderate' | 'minor';
  title: string;
  description: string;
  element?: string;
  wcagGuideline: string;
  suggestion: string;
  impact: number; // 1-10 scale
}

export interface AccessibilityReport {
  url: string;
  score: number;
  totalIssues: number;
  criticalIssues: number;
  moderateIssues: number;
  minorIssues: number;
  issues: AccessibilityIssue[];
  scannedAt: Date;
  isAccessible: boolean;
}

export interface CategoryStats {
  category: string;
  icon: string;
  total: number;
  critical: number;
  moderate: number;
  minor: number;
  color: string;
}
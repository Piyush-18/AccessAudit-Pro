import React from 'react';
import { Download, Share2, RefreshCw } from 'lucide-react';
import { AccessibilityReport as AccessibilityReportType } from '../types/accessibility';
import ScoreCard from './ScoreCard';
import CategoryStats from './CategoryStats';
import IssueCard from './IssueCard';

interface AccessibilityReportProps {
  report: AccessibilityReportType;
  onAnalyzeNew: () => void;
}

const AccessibilityReport: React.FC<AccessibilityReportProps> = ({ report, onAnalyzeNew }) => {
  const categoryStats = [
    {
      category: 'images',
      icon: 'image',
      total: report.issues.filter(issue => issue.category === 'images').length,
      critical: report.issues.filter(issue => issue.category === 'images' && issue.severity === 'critical').length,
      moderate: report.issues.filter(issue => issue.category === 'images' && issue.severity === 'moderate').length,
      minor: report.issues.filter(issue => issue.category === 'images' && issue.severity === 'minor').length,
      color: 'bg-blue-500'
    },
    {
      category: 'forms',
      icon: 'form',
      total: report.issues.filter(issue => issue.category === 'forms').length,
      critical: report.issues.filter(issue => issue.category === 'forms' && issue.severity === 'critical').length,
      moderate: report.issues.filter(issue => issue.category === 'forms' && issue.severity === 'moderate').length,
      minor: report.issues.filter(issue => issue.category === 'forms' && issue.severity === 'minor').length,
      color: 'bg-green-500'
    },
    {
      category: 'navigation',
      icon: 'navigation',
      total: report.issues.filter(issue => issue.category === 'navigation').length,
      critical: report.issues.filter(issue => issue.category === 'navigation' && issue.severity === 'critical').length,
      moderate: report.issues.filter(issue => issue.category === 'navigation' && issue.severity === 'moderate').length,
      minor: report.issues.filter(issue => issue.category === 'navigation' && issue.severity === 'minor').length,
      color: 'bg-purple-500'
    },
    {
      category: 'colors',
      icon: 'palette',
      total: report.issues.filter(issue => issue.category === 'colors').length,
      critical: report.issues.filter(issue => issue.category === 'colors' && issue.severity === 'critical').length,
      moderate: report.issues.filter(issue => issue.category === 'colors' && issue.severity === 'moderate').length,
      minor: report.issues.filter(issue => issue.category === 'colors' && issue.severity === 'minor').length,
      color: 'bg-pink-500'
    },
    {
      category: 'typography',
      icon: 'type',
      total: report.issues.filter(issue => issue.category === 'typography').length,
      critical: report.issues.filter(issue => issue.category === 'typography' && issue.severity === 'critical').length,
      moderate: report.issues.filter(issue => issue.category === 'typography' && issue.severity === 'moderate').length,
      minor: report.issues.filter(issue => issue.category === 'typography' && issue.severity === 'minor').length,
      color: 'bg-indigo-500'
    },
    {
      category: 'aria',
      icon: 'shield',
      total: report.issues.filter(issue => issue.category === 'aria').length,
      critical: report.issues.filter(issue => issue.category === 'aria' && issue.severity === 'critical').length,
      moderate: report.issues.filter(issue => issue.category === 'aria' && issue.severity === 'moderate').length,
      minor: report.issues.filter(issue => issue.category === 'aria' && issue.severity === 'minor').length,
      color: 'bg-red-500'
    },
    {
      category: 'keyboard',
      icon: 'keyboard',
      total: report.issues.filter(issue => issue.category === 'keyboard').length,
      critical: report.issues.filter(issue => issue.category === 'keyboard' && issue.severity === 'critical').length,
      moderate: report.issues.filter(issue => issue.category === 'keyboard' && issue.severity === 'moderate').length,
      minor: report.issues.filter(issue => issue.category === 'keyboard' && issue.severity === 'minor').length,
      color: 'bg-yellow-500'
    }
  ].filter(cat => cat.total > 0);

  const handleExportReport = () => {
    const reportData = {
      url: report.url,
      score: report.score,
      scannedAt: report.scannedAt,
      summary: {
        totalIssues: report.totalIssues,
        criticalIssues: report.criticalIssues,
        moderateIssues: report.moderateIssues,
        minorIssues: report.minorIssues,
        isAccessible: report.isAccessible
      },
      issues: report.issues
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <ScoreCard
        score={report.score}
        totalIssues={report.totalIssues}
        criticalIssues={report.criticalIssues}
        url={report.url}
      />

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleExportReport}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
          aria-label="Export accessibility report"
        >
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
        
        <button
          onClick={() => navigator.share && navigator.share({
            title: `Accessibility Report for ${report.url}`,
            text: `Accessibility Score: ${report.score}/100 - ${report.totalIssues} issues found`,
            url: window.location.href
          })}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-4 focus:ring-green-100 transition-all duration-200"
          aria-label="Share accessibility report"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
        
        <button
          onClick={onAnalyzeNew}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
          aria-label="Analyze another website"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Analyze Another</span>
        </button>
      </div>

      {categoryStats.length > 0 && (
        <CategoryStats categories={categoryStats} />
      )}

      {report.issues.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              Detailed Issues & Recommendations
            </h3>
            <span className="text-sm text-gray-500">
              {report.issues.length} issue{report.issues.length !== 1 ? 's' : ''} found
            </span>
          </div>
          
          <div className="space-y-6">
            {report.issues
              .sort((a, b) => {
                const severityOrder = { critical: 3, moderate: 2, minor: 1 };
                return severityOrder[b.severity] - severityOrder[a.severity];
              })
              .map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
          </div>
        </div>
      )}

      {report.issues.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div className="text-green-600 text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-green-800 mb-2">
            Excellent Accessibility!
          </h3>
          <p className="text-green-700">
            No accessibility issues were found. This website follows accessibility best practices!
          </p>
        </div>
      )}
    </div>
  );
};

export default AccessibilityReport;
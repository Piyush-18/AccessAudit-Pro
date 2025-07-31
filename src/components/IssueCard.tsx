import React from 'react';
import { AlertCircle, AlertTriangle, Info, ExternalLink, Lightbulb } from 'lucide-react';
import { AccessibilityIssue } from '../types/accessibility';

interface IssueCardProps {
  issue: AccessibilityIssue;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return AlertCircle;
      case 'moderate':
        return AlertTriangle;
      case 'minor':
        return Info;
      default:
        return Info;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'minor':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const Icon = getSeverityIcon(issue.severity);

  return (
    <div className={`border-2 rounded-xl p-6 ${getSeverityColor(issue.severity)} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start space-x-3 mb-4">
        <Icon className="h-6 w-6 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-800">{issue.title}</h4>
            <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wide ${
              issue.severity === 'critical' 
                ? 'bg-red-100 text-red-700'
                : issue.severity === 'moderate'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {issue.severity}
            </span>
          </div>
          <p className="text-gray-700 mb-3">{issue.description}</p>
          
          {issue.element && (
            <div className="bg-white/50 rounded-lg p-3 mb-3 border border-white/50">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Element
                </span>
              </div>
              <code className="text-sm text-gray-800 font-mono break-all">
                {issue.element}
              </code>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-white/50 rounded-lg p-4 border border-white/50">
          <div className="flex items-center space-x-2 mb-2">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <span className="font-medium text-gray-800">AI Suggestion</span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{issue.suggestion}</p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <ExternalLink className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">WCAG: {issue.wcagGuideline}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-gray-600">Impact:</span>
            <div className="flex space-x-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < issue.impact 
                      ? issue.severity === 'critical'
                        ? 'bg-red-500'
                        : issue.severity === 'moderate'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
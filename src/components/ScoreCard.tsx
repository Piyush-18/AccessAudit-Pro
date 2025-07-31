import React from 'react';
import { Shield, Award, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ScoreCardProps {
  score: number;
  totalIssues: number;
  criticalIssues: number;
  url: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ score, totalIssues, criticalIssues, url }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return AlertTriangle;
    return XCircle;
  };

  const ScoreIcon = getScoreIcon(score);
  const isAccessible = score >= 80;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Shield className="h-8 w-8 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">Accessibility Score</h2>
        </div>
        <p className="text-gray-600 break-all max-w-2xl mx-auto">{url}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="w-32 h-32 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeDasharray={`${score}, 100`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" className={`stop-color-${score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'}-500`} />
                    <stop offset="100%" className={`stop-color-${score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'}-600`} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                    {score}
                  </div>
                  <div className="text-sm text-gray-500">/ 100</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
            isAccessible 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <ScoreIcon className="h-5 w-5" />
            <span className="font-semibold">
              {isAccessible ? 'Accessible' : 'Needs Improvement'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{totalIssues}</div>
                <div className="text-sm text-gray-600">Total Issues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{criticalIssues}</div>
                <div className="text-sm text-gray-600">Critical</div>
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-r ${getScoreBackground(score)} rounded-lg p-4 text-white`}>
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-5 w-5" />
              <span className="font-semibold">Accessibility Rating</span>
            </div>
            <p className="text-sm opacity-90">
              {isAccessible 
                ? 'Excellent! This website follows accessibility best practices.'
                : score >= 60
                ? 'Good progress, but there are areas for improvement.'
                : 'Significant accessibility barriers need to be addressed.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
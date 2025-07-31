import React, { useState } from 'react';
import { Search, Globe, AlertCircle } from 'lucide-react';

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

const UrlInput: React.FC<UrlInputProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (inputUrl: string): boolean => {
    try {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      return urlPattern.test(inputUrl);
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    onAnalyze(formattedUrl);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
      <div className="text-center mb-6">
        <Globe className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Analyze Website Accessibility
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enter any website URL to get a comprehensive accessibility audit with actionable 
          recommendations to make it more inclusive for people with disabilities.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g., https://example.com)"
            className="w-full pl-12 pr-32 py-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
            disabled={isLoading}
            aria-label="Website URL to analyze"
            aria-describedby={error ? 'url-error' : 'url-description'}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute inset-y-0 right-0 px-6 py-2 m-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            aria-label="Start accessibility analysis"
          >
            <Search className="h-5 w-5" />
            <span className="font-medium">
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </span>
          </button>
        </div>
        
        {!error && (
          <p id="url-description" className="text-sm text-gray-500 mt-2 text-center">
            We'll analyze your website for WCAG 2.1 compliance and accessibility best practices
          </p>
        )}
        
        {error && (
          <div id="url-error" className="flex items-center space-x-2 text-red-600 mt-3 text-sm" role="alert">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default UrlInput;
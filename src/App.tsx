import React, { useState } from 'react';
import Header from './components/Header';
import UrlInput from './components/UrlInput';
import LoadingSpinner from './components/LoadingSpinner';
import AccessibilityReport from './components/AccessibilityReport';
import { AccessibilityReport as AccessibilityReportType } from './types/accessibility';
import { AccessibilityAnalyzer } from './utils/accessibilityAnalyzer';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<AccessibilityReportType | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const analyzer = new AccessibilityAnalyzer();

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setCurrentUrl(url);
    setReport(null);
    setError(null);

    try {
      // Simulate analysis time for better UX
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      const analysisReport = await analyzer.analyzeWebsite(url);
      setReport(analysisReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeNew = () => {
    setReport(null);
    setCurrentUrl('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {!isLoading && !report && (
          <UrlInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        )}
        
        {isLoading && (
          <LoadingSpinner url={currentUrl} />
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-red-800 mb-2">Analysis Failed</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={handleAnalyzeNew}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-100 transition-all duration-200"
            >
              Try Another URL
            </button>
          </div>
        )}
        
        {report && (
          <AccessibilityReport 
            report={report} 
            onAnalyzeNew={handleAnalyzeNew}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 mb-2">
            Made with ❤️ for a more accessible web
          </p>
          <p className="text-sm text-gray-500">
            Based on WCAG 2.1 guidelines and accessibility best practices
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
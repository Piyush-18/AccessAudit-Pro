import React from 'react';
import { Loader2, Search, Shield, Eye, CheckCircle } from 'lucide-react';

interface LoadingSpinnerProps {
  url: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ url }) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  
  const steps = [
    { icon: Search, text: 'Crawling website structure', duration: 2000 },
    { icon: Eye, text: 'Analyzing visual elements', duration: 3000 },
    { icon: Shield, text: 'Checking WCAG compliance', duration: 2500 },
    { icon: CheckCircle, text: 'Generating recommendations', duration: 2000 }
  ];

  React.useEffect(() => {
    const timers = steps.map((_, index) => {
      const delay = steps.slice(0, index).reduce((acc, step) => acc + step.duration, 1000);
      return setTimeout(() => setCurrentStep(index), delay);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="mb-8">
        <div className="relative inline-block">
          <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-blue-100 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Analyzing Accessibility
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        We're performing a comprehensive accessibility audit of{' '}
        <span className="font-medium text-blue-600 break-all">{url}</span>
      </p>

      <div className="space-y-4 max-w-md mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === index;
          const isCompleted = currentStep > index;
          
          return (
            <div
              key={index}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-blue-50 border border-blue-200'
                  : isCompleted
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div
                className={`flex-shrink-0 ${
                  isActive
                    ? 'text-blue-500'
                    : isCompleted
                    ? 'text-green-500'
                    : 'text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isActive
                    ? 'text-blue-700'
                    : isCompleted
                    ? 'text-green-700'
                    : 'text-gray-500'
                }`}
              >
                {step.text}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-1000 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
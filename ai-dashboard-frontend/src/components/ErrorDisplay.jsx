/**
 * ErrorDisplay Component
 * 
 * Displays error messages in a user-friendly way with helpful suggestions.
 * Includes retry functionality and example prompts to guide users.
 */

import React from 'react';
import { AlertCircle, RefreshCw, Lightbulb } from 'lucide-react';

const ErrorDisplay = ({ error, onRetry, suggestions = [] }) => {
  return (
    <div className="card border-2 border-red-200">
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        {/* Error Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-pulse"></div>
          <div className="relative bg-red-100 p-4 rounded-full">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center space-y-2 max-w-md">
          <h3 className="text-xl font-semibold text-gray-900">
            Oops! Something went wrong
          </h3>
          
          <p className="text-gray-600">
            {error || 'An unexpected error occurred while generating your chart.'}
          </p>
        </div>

        {/* Retry Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="w-full max-w-md mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Try these instead:
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500 max-w-md">
          <p>
            If the problem persists, try rephrasing your query or check the example prompts below for guidance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;

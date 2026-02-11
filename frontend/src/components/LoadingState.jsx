/**
 * Enhanced LoadingState Component
 * 
 * Displays an animated loading state with skeleton loaders,
 * progress bar, and rotating messages to keep users engaged.
 */

import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Database, Sparkles, BarChart3 } from 'lucide-react';

const LOADING_MESSAGES = [
  '🔍 Analyzing your query...',
  '📊 Fetching data from database...',
  '🎨 Generating visualization...',
  '✨ Applying final touches...',
];

const LoadingState = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Rotate through loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Simulate progress (reaches 90%, waits for actual completion)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const currentMessage = LOADING_MESSAGES[messageIndex];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Loading Card */}
      <div className="card">
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          {/* Animated Icon Group */}
          <div className="relative w-32 h-32">
            {/* Background pulse effects */}
            <div className="absolute inset-0 bg-primary-500 rounded-full opacity-20 animate-ping"></div>
            <div className="absolute inset-0 bg-primary-500 rounded-full opacity-30 animate-pulse"></div>
            
            {/* Rotating icons */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Center loading spinner */}
              <Loader2 className="absolute w-16 h-16 text-primary-600 animate-spin" />
              
              {/* Orbiting icons */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                <TrendingUp className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 text-green-500" />
              </div>
              
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
                <Database className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 text-blue-500" />
              </div>
              
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '5s' }}>
                <Sparkles className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Loading Message */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              Processing Your Request
            </h3>
            
            {/* Animated message with fade transition */}
            <p className="text-gray-600 min-h-[24px] animate-fade-in" key={messageIndex}>
              {currentMessage}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Processing...</span>
              <span>{Math.min(Math.round(progress), 100)}%</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i <= messageIndex
                    ? 'bg-primary-600 scale-125'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Subtle hint */}
          <p className="text-sm text-gray-500 text-center max-w-md">
            Complex queries may take a few seconds. Please wait...
          </p>
        </div>
      </div>

      {/* Skeleton Loader for Chart Preview */}
      <div className="card">
        <div className="space-y-4">
          {/* Skeleton Header */}
          <div className="animate-pulse space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-24 bg-gray-200 rounded"></div>
                <div className="h-9 w-28 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Skeleton Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-200">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-16 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton Chart */}
          <div className="bg-gray-50 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
            <div className="w-full max-w-3xl space-y-4 animate-pulse">
              {/* Skeleton bars for chart */}
              <div className="flex items-end justify-around h-64 gap-2">
                {[40, 70, 55, 85, 65, 90, 75, 60].map((height, i) => (
                  <div
                    key={i}
                    className="bg-gray-200 rounded-t w-full transition-all duration-1000"
                    style={{ 
                      height: `${height}%`,
                      animationDelay: `${i * 100}ms`
                    }}
                  ></div>
                ))}
              </div>
              {/* Skeleton axis */}
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-3 bg-gray-200 rounded w-10"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton Data Preview */}
      <div className="card">
        <div className="animate-pulse space-y-4">
          {/* Skeleton table header */}
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-40"></div>
            <div className="h-4 bg-gray-200 rounded w-4"></div>
          </div>

          {/* Skeleton table rows */}
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
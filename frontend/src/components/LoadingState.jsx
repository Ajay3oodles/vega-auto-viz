/**
 * LoadingState Component
 * 
 * Displays an animated loading state with rotating messages
 * to keep users engaged while their chart is being generated.
 */

import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Database, Sparkles } from 'lucide-react';
import { LOADING_MESSAGES } from '../constants';

const LoadingState = () => {
  // State to track current message index
  const [messageIndex, setMessageIndex] = useState(0);

  /**
   * Rotate through loading messages every 1.5 seconds
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Get current loading message
  const currentMessage = LOADING_MESSAGES[messageIndex];

  return (
    <div className="card">
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        {/* Animated Icon Group */}
        <div className="relative w-32 h-32">
          {/* Background pulse effect */}
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
          <p className="text-gray-600 min-h-[24px] animate-fade-in">
            {currentMessage}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === messageIndex
                  ? 'bg-primary-600 scale-125'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Subtle hint */}
        <p className="text-sm text-gray-500 text-center max-w-md">
          Complex queries may take a few seconds. We're fetching data and generating your visualization...
        </p>
      </div>
    </div>
  );
};

export default LoadingState;

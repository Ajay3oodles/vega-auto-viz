/**
 * Header Component
 * 
 * Displays the application header with title and description.
 * This is a presentational component (no state or logic).
 */

import React from 'react';
import { BarChart3, Sparkles } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Logo and Title Section */}
          <div className="flex items-center space-x-4">
            {/* Animated Logo Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500 rounded-lg blur-md opacity-30 animate-pulse-slow"></div>
              <div className="relative bg-gradient-to-br from-primary-500 to-purple-600 p-3 rounded-lg shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
            </div>
            
            {/* Title and Description */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                AI Dashboard
                <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Generate dynamic charts with natural language queries
              </p>
            </div>
          </div>
          
          {/* Optional: Add user menu or settings here */}
          {/* <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900">
              Settings
            </button>
          </div> */}
        </div>
      </div>
    </header>
  );
};

export default Header;

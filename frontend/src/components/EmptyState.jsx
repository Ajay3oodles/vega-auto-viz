/**
 * EmptyState Component
 * 
 * Displayed in main area when no widget is selected
 * Encourages user to create their first widget
 */

import React from 'react';
import { BarChart3, Sparkles, ArrowLeft } from 'lucide-react';

const EmptyState = ({ hasWidgets }) => {
  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="text-center max-w-md px-4">
        {/* Icon */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-primary-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-primary-500 to-purple-600 p-6 rounded-2xl">
            <BarChart3 className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
          {hasWidgets ? 'No Widget Selected' : 'Welcome to AI Dashboard'}
          <Sparkles className="w-6 h-6 text-yellow-500" />
        </h2>

        <p className="text-gray-600 mb-8">
          {hasWidgets ? (
            <>
              Select a widget from the sidebar or create a new one to get started
            </>
          ) : (
            <>
              Create your first widget by entering a query above or selecting an example below
            </>
          )}
        </p>

        {/* Visual Hint */}
        {hasWidgets && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <ArrowLeft className="w-4 h-4" />
            <span>Choose a widget from the left sidebar</span>
          </div>
        )}

        {/* Steps */}
        {!hasWidgets && (
          <div className="mt-8 space-y-3 text-left bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 text-center mb-4">
              Getting Started
            </h3>
            <div className
            ="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <p className="text-sm text-gray-700">
                  Enter a natural language query in the input box above
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <p className="text-sm text-gray-700">
                  Click "Generate Chart" to create your visualization
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <p className="text-sm text-gray-700">
                  Your widget will be saved automatically for future access
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
/**
 * App Component
 * 
 * Main application component that orchestrates all other components.
 * This is the "container" or "smart" component that manages state and logic.
 * 
 * Component Structure:
 * - Header: Application title and branding
 * - PromptInput: Text input for user queries
 * - LoadingState: Shown while processing
 * - ErrorDisplay: Shown if error occurs
 * - ChartDisplay: Shows generated chart
 * - ExamplePrompts: Quick-start examples
 * - Toast: Notification messages
 */

import React from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import ChartDisplay from './components/ChartDisplay';
import ExamplePrompts from './components/ExamplePrompts';
import LoadingState from './components/LoadingState';
import ErrorDisplay from './components/ErrorDisplay';
import Toast from './components/Toast';
import useChartGenerator from './hooks/useChartGenerator';

function App() {
  // Use custom hook to manage chart generation logic
  const {
    isLoading,
    chartData,
    error,
    successMessage,
    generateChart,
    retry,
    clearSuccessMessage,
    clearError,
  } = useChartGenerator();

  /**
   * Handle prompt submission from input
   */
  const handleSubmit = (prompt) => {
    console.log('📝 User submitted prompt:', prompt);
    generateChart(prompt);
  };

  /**
   * Handle example prompt selection
   */
  const handleExampleSelect = (prompt) => {
    console.log('💡 User selected example:', prompt);
    generateChart(prompt);
  };

  /**
   * Handle retry after error
   */
  const handleRetry = () => {
    console.log('🔄 Retrying...');
    if (chartData?.prompt) {
      generateChart(chartData.prompt);
    }
  };

  /**
   * Get error suggestions based on error message
   */
  const getErrorSuggestions = () => {
    if (!error) return [];
    
    // Provide helpful suggestions based on error type
    if (error.includes('connection') || error.includes('network')) {
      return [
        'Check your internet connection',
        'Make sure the backend server is running on port 5000',
        'Try refreshing the page',
      ];
    }
    
    return [
      'Try rephrasing your query more specifically',
      'Use simpler terms like "Show sales by category"',
      'Check the example prompts below for inspiration',
      'Make sure you specify what data you want to see',
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Prompt Input Section */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Ask Your Question
              </h2>
              <p className="text-sm text-gray-600">
                Type a natural language query to generate dynamic visualizations from your data
              </p>
            </div>
            
            <PromptInput 
              onSubmit={handleSubmit} 
              isLoading={isLoading} 
            />
          </section>

          {/* Results Section */}
          <section>
            {/* Show loading state while processing */}
            {isLoading && <LoadingState />}
            
            {/* Show error if something went wrong */}
            {error && !isLoading && (
              <ErrorDisplay 
                error={error}
                onRetry={handleRetry}
                suggestions={getErrorSuggestions()}
              />
            )}
            
            {/* Show chart if successfully generated */}
            {chartData && !isLoading && !error && (
              <ChartDisplay 
                chartData={chartData}
                onCopy={clearSuccessMessage}  // Not ideal, but works for demo
                onDownload={clearSuccessMessage}
              />
            )}
          </section>

          {/* Example Prompts Section - Always visible for guidance */}
          <section>
            <ExamplePrompts 
              onSelectPrompt={handleExampleSelect}
              isLoading={isLoading}
            />
          </section>

          {/* Help Section */}
          <section className="card bg-gradient-to-r from-primary-50 to-purple-50 border-2 border-primary-200">
            <div className="text-center py-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Need Help?
              </h3>
              <p className="text-gray-700 mb-4">
                The AI Dashboard uses natural language processing to understand your queries and generate visualizations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-primary-600 mb-2">📊 Supported Data</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Sales transactions</li>
                    <li>• User demographics</li>
                    <li>• Product inventory</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-primary-600 mb-2">🎨 Chart Types</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Bar charts</li>
                    <li>• Line charts</li>
                    <li>• Pie charts</li>
                    <li>• Scatter plots</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-primary-600 mb-2">🔍 Aggregations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Sum, Average</li>
                    <li>• Count, Min, Max</li>
                    <li>• Group by category</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>AI-Powered Dashboard © 2025 | Built with React, Vega-Lite, and Sequelize</p>
            <p className="mt-1">Generate dynamic charts from natural language queries</p>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      {successMessage && (
        <Toast 
          message={successMessage}
          type="success"
          onClose={clearSuccessMessage}
        />
      )}
      
      {error && (
        <Toast 
          message={error}
          type="error"
          onClose={clearError}
          duration={5000}  // Longer duration for errors
        />
      )}
    </div>
  );
}

export default App;

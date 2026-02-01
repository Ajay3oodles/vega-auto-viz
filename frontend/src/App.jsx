import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import ChartDisplay from './components/ChartDisplay';
import ExamplePrompts from './components/ExamplePrompts';
import LoadingState from './components/LoadingState';
import ErrorDisplay from './components/ErrorDisplay';
import Toast from './components/Toast';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isLoadingLastWidget, setIsLoadingLastWidget] = useState(true);

  // Load last widget on mount
  useEffect(() => {
    loadLastWidget();
  }, []);

  /**
   * Load the last saved widget from the backend
   */
  const loadLastWidget = async () => {
    try {
      setIsLoadingLastWidget(true);
      const response = await axios.get('/api/ai-chart/widgets/last');;
      
      if (response.data.success && response.data.widget) {
        const widget = response.data.widget;
        
        // Format widget data to match chartData structure
        setChartData({
          prompt: widget.prompt,
          vegaSpec: widget.vegaSpec,
          data: widget.vegaSpec.data.values, // Extract data from vegaSpec
          analysis: widget.analysis,
          dataCount: widget.vegaSpec.data.values.length,
          sql: widget.sqlQuery || '' // SQL might be null for security
        });
      }
    } catch (err) {
      // No widget found or error - that's okay, just show empty state
      console.log('No previous widget found');
    } finally {
      setIsLoadingLastWidget(false);
    }
  };

  /**
   * Handle prompt submission
   */
  const handleSubmit = async (prompt) => {
    setIsLoading(true);
    setError(null);
    setChartData(null);

    try {
      const response = await axios.post('/api/ai-chart', { prompt });
;

      if (response.data.success) {
        setChartData(response.data);
        showToast('Chart generated successfully!', 'success');
      } else {
        setError(response.data.message || 'Failed to generate chart');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      showToast('Failed to generate chart', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle example prompt selection
   */
  const handleExampleClick = (prompt) => {
    handleSubmit(prompt);
  };

  /**
   * Show toast notification
   */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  /**
   * Close toast
   */
  const closeToast = () => {
    setToast(null);
  };

  /**
   * Handle retry after error
   */
  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Prompt Input Section */}
          <section>
            <PromptInput onSubmit={handleSubmit} isLoading={isLoading} />
          </section>

          {/* Loading State for Initial Widget Load */}
          {isLoadingLastWidget && (
            <section>
              <div className="card">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading previous chart...</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Chart Display / Loading / Error Section */}
          {!isLoadingLastWidget && (
            <section>
              {isLoading && <LoadingState />}
              
              {!isLoading && error && (
                <ErrorDisplay
                  error={error}
                  onRetry={handleRetry}
                  suggestions={[
                    'Try rephrasing your query',
                    'Check if the table or column names are correct',
                    'Use simpler queries',
                  ]}
                />
              )}

              {!isLoading && !error && chartData && (
                <ChartDisplay
                  chartData={chartData}
                  onCopy={(msg) => showToast(msg, 'success')}
                  onDownload={(msg) => showToast(msg, 'success')}
                />
              )}

              {!isLoading && !error && !chartData && (
                <div className="card text-center py-12">
                  <p className="text-gray-600">
                    No chart yet. Enter a query above or select an example below to get started!
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Example Prompts Section */}
          {!isLoadingLastWidget && (
            <section>
              <ExamplePrompts
                onSelectPrompt={handleExampleClick}
                isLoading={isLoading}
              />
            </section>
          )}
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
}

export default App;
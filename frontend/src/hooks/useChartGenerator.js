/**
 * useChartGenerator Hook
 * 
 * Custom React hook that encapsulates all the logic for generating charts.
 * Manages state, handles API calls, and provides methods to the UI.
 * 
 * This is a "smart" hook - it contains business logic but no UI.
 */

import { useState, useCallback } from 'react';
import { generateChart } from '../services/api';
import { saveRecentPrompt, getErrorMessage } from '../utils';

/**
 * Hook to manage chart generation state and logic
 * 
 * @returns {Object} State and methods for chart generation
 */
const useChartGenerator = () => {
  // Loading state - true when API call is in progress
  const [isLoading, setIsLoading] = useState(false);
  
  // Current chart data from backend
  const [chartData, setChartData] = useState(null);
  
  // Error message if something goes wrong
  const [error, setError] = useState(null);
  
  // Success message for toast notifications
  const [successMessage, setSuccessMessage] = useState(null);

  /**
   * Generate chart from prompt
   * 
   * This function:
   * 1. Sets loading state
   * 2. Calls backend API
   * 3. Saves successful prompt to recent history
   * 4. Updates state with results or error
   * 
   * @param {string} prompt - User's natural language query
   */
  const handleGenerateChart = useCallback(async (prompt) => {
    try {
      // Clear any previous errors
      setError(null);
      setSuccessMessage(null);
      
      // Set loading state
      setIsLoading(true);
      
      console.log('🎯 Generating chart for prompt:', prompt);
      
      // Call backend API to generate chart
      const result = await generateChart(prompt);
      
      console.log('✅ Chart generated successfully:', result);
      
      // Save prompt to recent history (in localStorage)
      saveRecentPrompt(prompt);
      
      // Update state with chart data
      setChartData(result);
      setSuccessMessage('Chart generated successfully!');
      
    } catch (err) {
      // Handle errors
      console.error('❌ Error generating chart:', err);
      
      // Extract user-friendly error message
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      // Clear chart data on error
      setChartData(null);
      
    } finally {
      // Always turn off loading state
      setIsLoading(false);
    }
  }, []);

  /**
   * Retry last prompt
   * 
   * Useful when there's an error and user wants to try again
   */
  const handleRetry = useCallback(() => {
    if (chartData?.prompt) {
      handleGenerateChart(chartData.prompt);
    }
  }, [chartData, handleGenerateChart]);

  /**
   * Clear current chart and error
   * 
   * Resets to initial state
   */
  const handleClear = useCallback(() => {
    setChartData(null);
    setError(null);
    setSuccessMessage(null);
  }, []);

  /**
   * Dismiss success message
   */
  const clearSuccessMessage = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  /**
   * Dismiss error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Return all state and methods
  return {
    // State
    isLoading,
    chartData,
    error,
    successMessage,
    
    // Methods
    generateChart: handleGenerateChart,
    retry: handleRetry,
    clear: handleClear,
    clearSuccessMessage,
    clearError,
  };
};

export default useChartGenerator;

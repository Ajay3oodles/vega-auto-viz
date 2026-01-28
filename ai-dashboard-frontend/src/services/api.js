/**
 * API Service
 * 
 * This file handles all communication with the backend API.
 * It uses Axios to make HTTP requests and provides a clean interface
 * for the rest of the application to interact with the backend.
 */

import axios from 'axios';

// Create an Axios instance with default configuration
// This instance will be used for all API calls
const apiClient = axios.create({
  baseURL: '/api',  // Base URL for all requests (proxied to backend by Vite)
  timeout: 30000,   // Request timeout: 30 seconds
  headers: {
    'Content-Type': 'application/json',  // Default content type
  },
});

// Request interceptor - runs before every request
// Useful for adding auth tokens, logging, etc.
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // config.headers.Authorization = `Bearer ${token}`;
    
    console.log('🚀 API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - runs after every response
// Useful for handling errors globally, logging, etc.
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      console.error('❌ Response Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ No Response:', error.request);
    } else {
      // Error in request setup
      console.error('❌ Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Generate chart from natural language prompt
 * 
 * @param {string} prompt - Natural language query (e.g., "Show sales by category")
 * @returns {Promise<Object>} Response containing chart data and Vega-Lite spec
 * 
 * Example usage:
 * const result = await generateChart("Show total sales by region");
 * console.log(result.vegaSpec); // Vega-Lite specification
 * console.log(result.data);     // Raw data from database
 */
export const generateChart = async (prompt) => {
  try {
    const response = await apiClient.post('/chart-data', { prompt });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to generate chart'
    );
  }
};


/**
 * Get example prompts from backend
 * 
 * @returns {Promise<Object>} Object containing example prompts categorized by type
 * 
 * Example response:
 * {
 *   sales: ["Show total sales by category", ...],
 *   users: ["Show user distribution by country", ...],
 *   products: ["Show products by category", ...]
 * }
 */
export const getPromptExamples = async () => {
  try {
    const response = await apiClient.get('/ai-chart/examples');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to fetch examples'
    );
  }
};

/**
 * Health check for backend API
 * 
 * @returns {Promise<Object>} Response indicating backend status
 */
export const checkBackendHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend is not responding');
  }
};

// Export the configured axios instance for custom requests if needed
export default apiClient;

/**
 * Application Constants
 * 
 * This file contains all constant values used across the application.
 * Keeping constants in one place makes them easy to update and maintain.
 */

// Chart type configurations
export const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'arc',
  SCATTER: 'point',
  AREA: 'area',
};

// Chart type display names
export const CHART_TYPE_LABELS = {
  [CHART_TYPES.BAR]: 'Bar Chart',
  [CHART_TYPES.LINE]: 'Line Chart',
  [CHART_TYPES.PIE]: 'Pie Chart',
  [CHART_TYPES.SCATTER]: 'Scatter Plot',
  [CHART_TYPES.AREA]: 'Area Chart',
};

// Example prompts for quick start
export const QUICK_PROMPTS = {
  SALES: [
    'Show total sales by category',
    'Top 5 products by revenue',
    'Sales trend over time',
    'Average sales by region',
  ],
  USERS: [
    'User distribution by country',
    'Average age by country',
    'Users per subscription tier',
    'Total users by city',
  ],
  PRODUCTS: [
    'Products by category',
    'Average price by category',
    'Total inventory by supplier',
    'Top 10 expensive products',
  ],
};

// Loading messages to display while processing
export const LOADING_MESSAGES = [
  'Analyzing your query...',
  'Fetching data from database...',
  'Generating visualization...',
  'Preparing your chart...',
];

// Error messages
export const ERROR_MESSAGES = {
  EMPTY_PROMPT: 'Please enter a query to generate a chart',
  NETWORK_ERROR: 'Unable to connect to the server. Please check your connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  BACKEND_ERROR: 'Server error occurred. Please try a different query.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  CHART_GENERATED: 'Chart generated successfully!',
  DATA_LOADED: 'Data loaded successfully!',
};

// API endpoints (relative to base URL)
export const API_ENDPOINTS = {
  GENERATE_CHART: '/ai-chart',
  GET_EXAMPLES: '/ai-chart/examples',
  HEALTH_CHECK: '/health',
};

// UI Configuration
export const UI_CONFIG = {
  MAX_PROMPT_LENGTH: 500,
  CHART_ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
};

// Vega-Lite theme configuration
export const VEGA_THEME = {
  background: 'white',
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1f2937',
  },
  axis: {
    labelFontSize: 12,
    titleFontSize: 14,
    titleColor: '#4b5563',
    labelColor: '#6b7280',
  },
  legend: {
    labelFontSize: 12,
    titleFontSize: 14,
  },
};

// Local storage keys
export const STORAGE_KEYS = {
  RECENT_PROMPTS: 'ai_dashboard_recent_prompts',
  USER_PREFERENCES: 'ai_dashboard_preferences',
  THEME: 'ai_dashboard_theme',
};

// Maximum number of recent prompts to store
export const MAX_RECENT_PROMPTS = 10;

// Feature flags (for enabling/disabling features)
export const FEATURES = {
  SAVE_CHARTS: true,
  EXPORT_DATA: true,
  SHARE_CHARTS: false,  // Set to true when implementing share feature
  DARK_MODE: false,     // Set to true when implementing dark mode
};

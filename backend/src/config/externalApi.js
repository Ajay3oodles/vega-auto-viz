// config/externalApi.js
// Configuration for external database API

export const externalApiConfig = {
  // Base URL of your external Node.js API
  baseUrl: process.env.EXTERNAL_API_URL || 'http://localhost:4000',
  
  // API endpoints
  endpoints: {
    schema: '/api/database/schema',
    execute: '/api/database/execute',
    test: '/api/database/test',
    metadata: '/api/database/metadata',
    stats: '/api/database/stats'
  },
  
  // Request timeout in milliseconds
  timeout: parseInt(process.env.EXTERNAL_API_TIMEOUT) || 30000,
  
  // API Key for authentication (optional)
  apiKey: process.env.EXTERNAL_API_KEY || null,
  
  // Retry configuration
  retry: {
    maxRetries: 3,
    retryDelay: 1000
  }
};
// config/externalApi.js
// Configuration for external database API

export const externalApiConfig = {
  // Base URL of your external Node.js API (running on port 3000)
  baseUrl: process.env.EXTERNAL_API_URL || 'http://localhost:3000',
  
  // API endpoints
  endpoints: {
    schema: '/api/database/schema',
    execute: '/api/database/execute',
    test: '/api/database/test',
    metadata: '/api/database/metadata',
    stats: '/api/database/stats',
    health: '/api/database/health',
    tables: '/api/database/tables',
    refreshSchema: '/api/database/schema/refresh'
  },
  
  // Request timeout in milliseconds
  timeout: parseInt(process.env.EXTERNAL_API_TIMEOUT) || 30000,
  
  // API Key for authentication
  apiKey: process.env.EXTERNAL_API_KEY || null,
  
  // Retry configuration
  retry: {
    maxRetries: 3,
    retryDelay: 1000
  }
};
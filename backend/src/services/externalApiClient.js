// services/externalApiClient.js
// HTTP client for communicating with external database API

import { externalApiConfig } from '../config/externalApi.js';

/**
 * Custom error class for external API errors
 */
export class ExternalApiError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = 'ExternalApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Make HTTP request to external API
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
async function makeRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    timeout = externalApiConfig.timeout
  } = options;

  const url = `${externalApiConfig.baseUrl}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Add API key if configured
  if (externalApiConfig.apiKey) {
    headers['X-API-Key'] = externalApiConfig.apiKey;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log(`🌐 API Request: ${method} ${url}`);
    
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ExternalApiError(
        errorData.message || `API request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    console.log(`✅ API Response received from ${endpoint}`);
    return data;

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new ExternalApiError('Request timeout', 408);
    }
    
    if (error instanceof ExternalApiError) {
      throw error;
    }
    
    throw new ExternalApiError(
      `Failed to connect to external API: ${error.message}`,
      503
    );
  }
}

/**
 * Make request with retry logic
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
async function makeRequestWithRetry(endpoint, options = {}) {
  const { maxRetries, retryDelay } = externalApiConfig.retry;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await makeRequest(endpoint, options);
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        console.warn(`⚠️ API request failed (attempt ${attempt}/${maxRetries}), retrying...`);
        await sleep(retryDelay * attempt);
      }
    }
  }

  throw lastError;
}

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Exported API Methods
// ============================================

/**
 * Fetch database schema from external API
 * @param {boolean} forceRefresh - Force refresh the schema
 * @returns {Promise<Object>} Database schema
 */
export async function fetchSchemaFromApi(forceRefresh = false) {
  const endpoint = `${externalApiConfig.endpoints.schema}${forceRefresh ? '?refresh=true' : ''}`;
  const response = await makeRequestWithRetry(endpoint);
  
  if (!response.success) {
    throw new ExternalApiError(response.message || 'Failed to fetch schema', 500);
  }
  
  return response.schema;
}

/**
 * Execute SQL query via external API
 * @param {string} sqlQuery - SQL query to execute
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Query results
 */
export async function executeQueryViaApi(sqlQuery, options = {}) {
  const response = await makeRequestWithRetry(externalApiConfig.endpoints.execute, {
    method: 'POST',
    body: {
      query: sqlQuery,
      timeout: options.timeout || 30000,
      maxRows: options.maxRows || 10000
    }
  });
  
  if (!response.success) {
    throw new ExternalApiError(response.message || 'Query execution failed', 500, {
      sql: sqlQuery,
      error: response.error
    });
  }
  
  return response.data;
}

/**
 * Test connection to external API
 * @returns {Promise<Object>} Connection test result
 */
export async function testApiConnection() {
  const response = await makeRequest(externalApiConfig.endpoints.test);
  return response;
}

/**
 * Get database metadata via external API
 * @returns {Promise<Object>} Database metadata
 */
export async function getMetadataViaApi() {
  const response = await makeRequestWithRetry(externalApiConfig.endpoints.metadata);
  
  if (!response.success) {
    throw new ExternalApiError(response.message || 'Failed to fetch metadata', 500);
  }
  
  return response.metadata;
}

/**
 * Get database statistics via external API
 * @returns {Promise<Object>} Database statistics
 */
export async function getStatsViaApi() {
  const response = await makeRequestWithRetry(externalApiConfig.endpoints.stats);
  
  if (!response.success) {
    throw new ExternalApiError(response.message || 'Failed to fetch stats', 500);
  }
  
  return response.stats;
}

/**
 * Check health of external API
 * @returns {Promise<Object>} Health status
 */
export async function checkApiHealth() {
  const response = await makeRequest(externalApiConfig.endpoints.health);
  return response;
}
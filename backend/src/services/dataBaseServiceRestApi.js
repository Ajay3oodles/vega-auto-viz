// services/databaseService.js
// Service layer for database operations - USES EXTERNAL API

import { 
  executeQueryViaApi, 
  testApiConnection, 
  getMetadataViaApi,
  getStatsViaApi,
  ExternalApiError 
} from './externalApiClient.js';

/**
 * Execute SQL query via external API
 * @param {string} sqlQuery - SQL query to execute
 * @param {Object} options - Execution options
 * @returns {Promise<Array>} Query results
 */
export async function executeQuery(sqlQuery, options = {}) {
  const {
    timeout = 30000,
    maxRows = 10000
  } = options;

  try {
    console.log('💾 Executing query via external API...');
    const startTime = Date.now();

    const results = await executeQueryViaApi(sqlQuery, { timeout, maxRows });

    const executionTime = Date.now() - startTime;
    console.log(`✅ Query executed in ${executionTime}ms, returned ${results.length} rows`);

    return results;

  } catch (error) {
    console.error('❌ Query execution error:', error.message);
    throw new DatabaseError('Query execution failed', error);
  }
}

/**
 * Validate SQL query before execution
 * @param {string} sqlQuery - SQL query to validate
 * @param {Object} schema - Database schema
 * @returns {Object} Validation result
 */
export function validateQuery(sqlQuery, schema) {
  const validation = {
    valid: true,
    warnings: [],
    errors: []
  };

  // Check for dangerous operations
  const dangerousPatterns = [
    /DROP\s+/i,
    /DELETE\s+/i,
    /TRUNCATE\s+/i,
    /ALTER\s+/i,
    /CREATE\s+/i,
    /INSERT\s+/i,
    /UPDATE\s+/i,
    /GRANT\s+/i,
    /REVOKE\s+/i
  ];

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(sqlQuery)) {
      validation.valid = false;
      validation.errors.push(`Dangerous operation detected: ${pattern}`);
    }
  });

  // Check for SELECT statement
  if (!/^\s*(SELECT|WITH)\b/i.test(sqlQuery)) {
    validation.valid = false;
    validation.errors.push('Only SELECT queries are allowed');
  }

  // Extract table names from SQL
  const tablePattern = /FROM\s+["'\`]?(\w+)["'\`]?|JOIN\s+["'\`]?(\w+)["'\`]?/gi;
  const matches = [...sqlQuery.matchAll(tablePattern)];
  const tablesInSQL = matches.map(m => m[1] || m[2]).filter(Boolean);

  // Validate tables exist in schema
  if (schema && schema.tables) {
    const schemaTableNames = schema.tables.map(t => t.name.toLowerCase());
    tablesInSQL.forEach(table => {
      if (!schemaTableNames.includes(table.toLowerCase())) {
        validation.warnings.push(`Table "${table}" not found in schema`);
      }
    });
  }

  return validation;
}

/**
 * Test database connection via external API
 * @returns {Promise<Object>} Connection test result
 */
export async function testConnection() {
  try {
    const result = await testApiConnection();
    
    return {
      success: true,
      message: 'External API connection successful',
      ...result
    };

  } catch (error) {
    throw new Error(`External API connection failed: ${error.message}`);
  }
}

/**
 * Get database metadata via external API
 * @returns {Promise<Object>} Database metadata
 */
export async function getDatabaseMetadata() {
  try {
    return await getMetadataViaApi();
  } catch (error) {
    console.warn('Could not fetch database metadata:', error.message);
    return {
      database: 'Unknown',
      dialect: 'Unknown',
      version: 'Unknown',
      source: 'external-api'
    };
  }
}

/**
 * Get database statistics via external API
 * @returns {Promise<Object>} Database statistics
 */
export async function getDatabaseStats() {
  try {
    return await getStatsViaApi();
  } catch (error) {
    console.warn('Could not fetch database stats:', error.message);
    return null;
  }
}

/**
 * Custom Database Error class
 */
class DatabaseError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError;
    this.sql = originalError?.details?.sql;
    this.sqlMessage = originalError?.message;
  }
}

export { DatabaseError };
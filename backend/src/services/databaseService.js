// services/databaseService.js
// Service layer for database operations
// Handles SQL execution and data retrieval

import { sequelize } from '../models/index.js';
import { QueryTypes } from 'sequelize';

/**
 * Execute SQL query safely
 * 
 * @param {string} sqlQuery - SQL query to execute
 * @param {Object} options - Execution options
 * @returns {Promise<Array>} Query results
 */
export async function executeQuery(sqlQuery, options = {}) {
  const {
    timeout = 30000, // 30 seconds default
    maxRows = 10000  // Max rows to prevent memory issues
  } = options;

  try {
    console.log('💾 Executing query...');
    const startTime = Date.now();

    const results = await sequelize.query(sqlQuery, {
      type: QueryTypes.SELECT,
      timeout
    });

    const executionTime = Date.now() - startTime;
    console.log(`✅ Query executed in ${executionTime}ms, returned ${results.length} rows`);

    // Check if results exceed max rows
    if (results.length > maxRows) {
      console.warn(`⚠️  Query returned ${results.length} rows, limiting to ${maxRows}`);
      return results.slice(0, maxRows);
    }

    return results;

  } catch (error) {
    console.error('❌ Query execution error:', error.message);
    throw new DatabaseError('Query execution failed', error);
  }
}

/**
 * Validate SQL query before execution
 * 
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
    /DROP\s+TABLE/i,
    /DROP\s+DATABASE/i,
    /DELETE\s+FROM.*WHERE/i,
    /TRUNCATE/i,
    /ALTER\s+TABLE/i,
    /CREATE\s+TABLE/i
  ];

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(sqlQuery)) {
      validation.valid = false;
      validation.errors.push(`Dangerous operation detected: ${pattern}`);
    }
  });

  // Check for SELECT statement
  if (!/^\s*SELECT/i.test(sqlQuery)) {
    validation.valid = false;
    validation.errors.push('Only SELECT queries are allowed');
  }

  // Extract table names from SQL
  const tablePattern = /FROM\s+(\w+)|JOIN\s+(\w+)/gi;
  const matches = [...sqlQuery.matchAll(tablePattern)];
  const tablesInSQL = matches.map(m => m[1] || m[2]).filter(Boolean);

  // Validate tables exist in schema
  const schemaTableNames = schema.tables.map(t => t.name);
  tablesInSQL.forEach(table => {
    if (!schemaTableNames.includes(table)) {
      validation.warnings.push(`Table "${table}" not found in schema`);
    }
  });

  return validation;
}

/**
 * Get query execution statistics
 * 
 * @param {string} sqlQuery - SQL query
 * @returns {Promise<Object>} Query statistics
 */
export async function getQueryStats(sqlQuery) {
  try {
    const explainQuery = `EXPLAIN (FORMAT JSON) ${sqlQuery}`;
    const result = await sequelize.query(explainQuery, {
      type: QueryTypes.SELECT
    });

    return {
      plan: result[0],
      estimated: true
    };

  } catch (error) {
    console.warn('Could not get query stats:', error.message);
    return null;
  }
}

/**
 * Test database connection
 * 
 * @returns {Promise<Object>} Connection test result
 */
export async function testConnection() {
  try {
    await sequelize.authenticate();
    
    return {
      success: true,
      message: 'Database connection successful',
      database: sequelize.config.database,
      dialect: sequelize.getDialect(),
      host: sequelize.config.host
    };

  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

/**
 * Get database metadata
 * 
 * @returns {Promise<Object>} Database metadata
 */
export async function getDatabaseMetadata() {
  const dialect = sequelize.getDialect();
  
  let versionQuery;
  switch (dialect) {
    case 'postgres':
      versionQuery = 'SELECT version();';
      break;
    case 'mysql':
    case 'mariadb':
      versionQuery = 'SELECT VERSION();';
      break;
    case 'sqlite':
      versionQuery = 'SELECT sqlite_version();';
      break;
    default:
      versionQuery = null;
  }

  let version = 'Unknown';
  if (versionQuery) {
    try {
      const result = await sequelize.query(versionQuery, {
        type: QueryTypes.SELECT
      });
      version = Object.values(result[0])[0];
    } catch (error) {
      console.warn('Could not fetch database version:', error.message);
    }
  }

  return {
    database: sequelize.config.database,
    dialect,
    version,
    host: sequelize.config.host,
    port: sequelize.config.port
  };
}

/**
 * Custom Database Error class
 */
class DatabaseError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError;
    this.sql = originalError?.sql;
    this.sqlMessage = originalError?.message;
  }
}

export { DatabaseError };
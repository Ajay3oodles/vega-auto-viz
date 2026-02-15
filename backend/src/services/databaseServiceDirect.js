// services/databaseServiceDirect.js
// Direct database connection service

import pg from 'pg';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';

const { Pool } = pg;

/**
 * Database configuration from environment variables
 */
const dbConfig = {
  dialect: process.env.DB_DIALECT || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'your_database',
  username: process.env.DB_USER || 'your_user',
  password: process.env.DB_PASSWORD || 'your_password',
  
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE) || 10000
  },
  
  timeout: parseInt(process.env.DB_TIMEOUT) || 30000,
  
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  } : false
};

let connectionPool = null;
let sequelizeInstance = null;

function initializeConnectionPool() {
  if (connectionPool) return connectionPool;

  console.log(`🔌 Initializing ${dbConfig.dialect} connection pool...`);

  if (dbConfig.dialect === 'postgres') {
    connectionPool = new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.username,
      password: dbConfig.password,
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      idleTimeoutMillis: dbConfig.pool.idle,
      connectionTimeoutMillis: dbConfig.pool.acquire,
      ssl: dbConfig.ssl
    });

    connectionPool.on('error', (err) => {
      console.error('❌ Unexpected database pool error:', err);
    });
  } else if (dbConfig.dialect === 'mysql') {
    connectionPool = mysql.createPool({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.username,
      password: dbConfig.password,
      waitForConnections: true,
      connectionLimit: dbConfig.pool.max,
      queueLimit: 0,
      ssl: dbConfig.ssl
    });
  }

  return connectionPool;
}

function initializeSequelize() {
  if (sequelizeInstance) return sequelizeInstance;

  sequelizeInstance = new Sequelize({
    dialect: dbConfig.dialect,
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    username: dbConfig.username,
    password: dbConfig.password,
    pool: dbConfig.pool,
    logging: false,
    dialectOptions: dbConfig.ssl ? { ssl: dbConfig.ssl } : {}
  });

  return sequelizeInstance;
}

/**
 * Execute SQL query directly against database
 */
export async function executeQuery(sqlQuery, options = {}) {
  const {
    timeout = dbConfig.timeout,
    maxRows = 10000
  } = options;

  const pool = initializeConnectionPool();
  const startTime = Date.now();

  try {
    console.log('💾 Executing query directly on database...');
    console.log('📝 SQL:', sqlQuery);

    let results;

    if (dbConfig.dialect === 'postgres') {
      const client = await pool.connect();
      try {
        await client.query(`SET statement_timeout = ${timeout}`);
        const queryResult = await client.query(sqlQuery);
        results = queryResult.rows;
      } finally {
        client.release();
      }
    } else if (dbConfig.dialect === 'mysql') {
      const [rows] = await pool.query({
        sql: sqlQuery,
        timeout: timeout
      });
      results = rows;
    } else {
      const sequelize = initializeSequelize();
      const [queryResults] = await sequelize.query(sqlQuery, {
        timeout: timeout,
        type: Sequelize.QueryTypes.SELECT
      });
      results = queryResults;
    }

    if (results.length > maxRows) {
      console.warn(`⚠️ Query returned ${results.length} rows, limiting to ${maxRows}`);
      results = results.slice(0, maxRows);
    }

    const executionTime = Date.now() - startTime;
    console.log(`✅ Query executed in ${executionTime}ms, returned ${results.length} rows`);

    return results;

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`❌ Query execution error after ${executionTime}ms:`, error.message);
    throw new DatabaseError('Query execution failed', error, sqlQuery);
  }
}

/**
 * Fetch database schema
 */
export async function fetchDatabaseSchema(forceRefresh = false) {
  const sequelize = initializeSequelize();

  try {
    console.log('🔍 Fetching database schema...');

    await sequelize.authenticate();

    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();

    const schema = {
      database: dbConfig.database,
      dialect: dbConfig.dialect,
      tables: []
    };

    for (const tableName of tables) {
      try {
        const columns = await queryInterface.describeTable(tableName);
        
        const tableSchema = {
          name: tableName,
          columns: Object.keys(columns).map(columnName => ({
            name: columnName,
            type: columns[columnName].type,
            allowNull: columns[columnName].allowNull,
            defaultValue: columns[columnName].defaultValue,
            primaryKey: columns[columnName].primaryKey || false
          }))
        };

        schema.tables.push(tableSchema);
      } catch (error) {
        console.warn(`⚠️ Could not fetch schema for table ${tableName}:`, error.message);
      }
    }

    console.log(`✅ Schema fetched: ${schema.tables.length} tables found`);
    return schema;

  } catch (error) {
    console.error('❌ Failed to fetch database schema:', error);
    throw new DatabaseError('Schema fetch failed', error);
  }
}

/**
 * Validate SQL query before execution
 */
export function validateQuery(sqlQuery, schema) {
  const validation = {
    valid: true,
    warnings: [],
    errors: []
  };

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
      validation.errors.push(`Dangerous operation detected: ${pattern.source}`);
    }
  });

  if (!/^\s*(SELECT|WITH)\b/i.test(sqlQuery)) {
    validation.valid = false;
    validation.errors.push('Only SELECT queries are allowed');
  }

  const tablePattern = /FROM\s+["'\`]?(\w+)["'\`]?|JOIN\s+["'\`]?(\w+)["'\`]?/gi;
  const matches = [...sqlQuery.matchAll(tablePattern)];
  const tablesInSQL = matches.map(m => m[1] || m[2]).filter(Boolean);

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
 * Test database connection
 */
export async function testConnection() {
  try {
    const sequelize = initializeSequelize();
    await sequelize.authenticate();
    
    return {
      success: true,
      message: 'Database connection successful',
      dialect: dbConfig.dialect,
      host: dbConfig.host,
      database: dbConfig.database
    };

  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

/**
 * Get database metadata
 */
export async function getDatabaseMetadata() {
  try {
    const sequelize = initializeSequelize();
    const dialect = sequelize.getDialect();
    
    let versionQuery;
    switch (dialect) {
      case 'postgres':
        versionQuery = 'SELECT version()';
        break;
      case 'mysql':
        versionQuery = 'SELECT VERSION()';
        break;
      case 'mssql':
        versionQuery = 'SELECT @@VERSION';
        break;
      default:
        versionQuery = null;
    }

    let version = 'Unknown';
    if (versionQuery) {
      const [results] = await sequelize.query(versionQuery);
      version = Object.values(results[0])[0];
    }

    return {
      database: dbConfig.database,
      dialect: dialect,
      version: version,
      host: dbConfig.host,
      port: dbConfig.port,
      source: 'direct-connection'
    };

  } catch (error) {
    console.warn('Could not fetch database metadata:', error.message);
    return {
      database: dbConfig.database,
      dialect: dbConfig.dialect,
      version: 'Unknown',
      source: 'direct-connection'
    };
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  try {
    const schema = await fetchDatabaseSchema();
    const sequelize = initializeSequelize();
    
    const stats = {
      totalTables: schema.tables.length,
      tables: []
    };

    for (const table of schema.tables) {
      try {
        const countQuery = `SELECT COUNT(*) as count FROM ${table.name}`;
        const [results] = await sequelize.query(countQuery);
        const count = parseInt(results[0].count);

        stats.tables.push({
          name: table.name,
          rowCount: count,
          columnCount: table.columns.length
        });
      } catch (error) {
        console.warn(`⚠️ Could not get stats for table ${table.name}`);
      }
    }

    return stats;

  } catch (error) {
    console.warn('Could not fetch database stats:', error.message);
    return null;
  }
}

/**
 * Close database connections
 */
export async function closeConnections() {
  console.log('🔌 Closing database connections...');
  
  if (connectionPool) {
    if (dbConfig.dialect === 'postgres') {
      await connectionPool.end();
    } else if (dbConfig.dialect === 'mysql') {
      await connectionPool.end();
    }
    connectionPool = null;
  }

  if (sequelizeInstance) {
    await sequelizeInstance.close();
    sequelizeInstance = null;
  }

  console.log('✅ Database connections closed');
}

class DatabaseError extends Error {
  constructor(message, originalError, sql = null) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError;
    this.sql = sql;
    this.sqlMessage = originalError?.message;
  }
}

export { DatabaseError };
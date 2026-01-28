// utils/databaseSchema.js
// Dynamic database schema detection and management

import { sequelize } from '../models/index.js';
import { QueryTypes } from 'sequelize';

/**
 * Get all tables in the database dynamically
 * Works with PostgreSQL, MySQL, SQLite
 * 
 * @returns {Promise<Array>} List of table names
 */
export async function getAllTables() {
  try {
    const dialect = sequelize.getDialect();
    let query;

    switch (dialect) {
      case 'postgres':
        query = `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          AND table_name NOT LIKE '%SequelizeMeta%'
          ORDER BY table_name;
        `;
        break;

      case 'mysql':
      case 'mariadb':
        query = `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = DATABASE()
          AND table_name NOT LIKE '%SequelizeMeta%'
          ORDER BY table_name;
        `;
        break;

      case 'sqlite':
        query = `
          SELECT name as table_name 
          FROM sqlite_master 
          WHERE type='table' 
          AND name NOT LIKE 'sqlite_%'
          AND name NOT LIKE '%SequelizeMeta%'
          ORDER BY name;
        `;
        break;

      default:
        throw new Error(`Unsupported database dialect: ${dialect}`);
    }

    const results = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    return results.map(row => row.table_name || row.TABLE_NAME);

  } catch (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
}

/**
 * Get columns for a specific table with metadata
 * 
 * @param {string} tableName - Name of the table
 * @returns {Promise<Array>} Array of column objects with metadata
 */
export async function getTableColumns(tableName) {
  try {
    const dialect = sequelize.getDialect();
    let query;

    switch (dialect) {
      case 'postgres':
        query = `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale,
            (
              SELECT pg_catalog.col_description(c.oid, cols.ordinal_position::int)
              FROM pg_catalog.pg_class c
              WHERE c.oid = (SELECT ('public.' || cols.table_name)::regclass::oid)
              AND c.relname = cols.table_name
            ) as column_comment
          FROM information_schema.columns cols
          WHERE table_schema = 'public' 
          AND table_name = :tableName
          ORDER BY ordinal_position;
        `;
        break;

      case 'mysql':
      case 'mariadb':
        query = `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale,
            column_comment
          FROM information_schema.columns
          WHERE table_schema = DATABASE()
          AND table_name = :tableName
          ORDER BY ordinal_position;
        `;
        break;

      case 'sqlite':
        // SQLite uses PRAGMA for table info
        const tableInfo = await sequelize.query(`PRAGMA table_info(${tableName})`, {
          type: QueryTypes.SELECT
        });

        return tableInfo.map(col => ({
          column_name: col.name,
          data_type: col.type,
          is_nullable: col.notnull === 0 ? 'YES' : 'NO',
          column_default: col.dflt_value,
          column_comment: null
        }));

      default:
        throw new Error(`Unsupported database dialect: ${dialect}`);
    }

    const results = await sequelize.query(query, {
      replacements: { tableName },
      type: QueryTypes.SELECT
    });

    return results.map(col => ({
      name: col.column_name || col.COLUMN_NAME,
      type: normalizeDataType(col.data_type || col.DATA_TYPE),
      nullable: (col.is_nullable || col.IS_NULLABLE) === 'YES',
      default: col.column_default || col.COLUMN_DEFAULT,
      maxLength: col.character_maximum_length || col.CHARACTER_MAXIMUM_LENGTH,
      precision: col.numeric_precision || col.NUMERIC_PRECISION,
      scale: col.numeric_scale || col.NUMERIC_SCALE,
      comment: col.column_comment || col.COLUMN_COMMENT || ''
    }));

  } catch (error) {
    console.error(`Error fetching columns for table ${tableName}:`, error);
    throw error;
  }
}

/**
 * Normalize data types across different databases
 * 
 * @param {string} dataType - Database-specific data type
 * @returns {string} Normalized data type
 */
function normalizeDataType(dataType) {
  const typeMap = {
    // Integers
    'integer': 'INTEGER',
    'int': 'INTEGER',
    'smallint': 'INTEGER',
    'bigint': 'INTEGER',
    'serial': 'INTEGER',
    'bigserial': 'INTEGER',

    // Decimals
    'numeric': 'DECIMAL',
    'decimal': 'DECIMAL',
    'real': 'DECIMAL',
    'double precision': 'DECIMAL',
    'float': 'DECIMAL',
    'money': 'DECIMAL',

    // Strings
    'character varying': 'STRING',
    'varchar': 'STRING',
    'character': 'STRING',
    'char': 'STRING',
    'text': 'TEXT',

    // Dates
    'timestamp without time zone': 'TIMESTAMP',
    'timestamp with time zone': 'TIMESTAMP',
    'timestamp': 'TIMESTAMP',
    'datetime': 'TIMESTAMP',
    'date': 'DATE',
    'time': 'TIME',

    // Booleans
    'boolean': 'BOOLEAN',
    'bool': 'BOOLEAN',

    // JSON
    'json': 'JSON',
    'jsonb': 'JSON',

    // Arrays
    'array': 'ARRAY'
  };

  const lowerType = dataType.toLowerCase();
  return typeMap[lowerType] || dataType.toUpperCase();
}

/**
 * Get foreign key relationships for a table
 * 
 * @param {string} tableName - Name of the table
 * @returns {Promise<Array>} Array of foreign key relationships
 */
export async function getTableRelationships(tableName) {
  try {
    const dialect = sequelize.getDialect();
    let query;

    switch (dialect) {
      case 'postgres':
        query = `
          SELECT
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            tc.constraint_name
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = :tableName
            AND tc.table_schema = 'public';
        `;
        break;

      case 'mysql':
      case 'mariadb':
        query = `
          SELECT
            column_name,
            referenced_table_name AS foreign_table_name,
            referenced_column_name AS foreign_column_name,
            constraint_name
          FROM information_schema.key_column_usage
          WHERE table_schema = DATABASE()
            AND table_name = :tableName
            AND referenced_table_name IS NOT NULL;
        `;
        break;

      case 'sqlite':
        // SQLite uses PRAGMA for foreign keys
        const foreignKeys = await sequelize.query(`PRAGMA foreign_key_list(${tableName})`, {
          type: QueryTypes.SELECT
        });

        return foreignKeys.map(fk => ({
          column_name: fk.from,
          foreign_table_name: fk.table,
          foreign_column_name: fk.to,
          constraint_name: `fk_${tableName}_${fk.from}`
        }));

      default:
        return [];
    }

    return await sequelize.query(query, {
      replacements: { tableName },
      type: QueryTypes.SELECT
    });

  } catch (error) {
    console.error(`Error fetching relationships for table ${tableName}:`, error);
    return [];
  }
}

/**
 * Get complete database schema with all tables, columns, and relationships
 * This is the main function to call for getting full schema
 * 
 * @returns {Promise<Object>} Complete database schema
 */
export async function getCompleteSchema() {
  try {
    console.log('🔍 Scanning database schema...');

    const tables = await getAllTables();
    console.log(`📊 Found ${tables.length} tables:`, tables);

    const schema = {
      database: sequelize.config.database,
      dialect: sequelize.getDialect(),
      tables: []
    };

    // Get details for each table
    for (const tableName of tables) {
      console.log(`  ↳ Analyzing table: ${tableName}`);

      const columns = await getTableColumns(tableName);
      const relationships = await getTableRelationships(tableName);

      // Infer table description from name
      const description = inferTableDescription(tableName);

      schema.tables.push({
        name: tableName,
        description,
        columns: columns.map(col => ({
          name: col.name,
          type: col.type,
          nullable: col.nullable,
          description: col.comment || inferColumnDescription(col.name, col.type)
        })),
        relationships: relationships.map(rel => ({
          type: 'belongsTo',
          column: rel.column_name,
          foreignTable: rel.foreign_table_name,
          foreignColumn: rel.foreign_column_name
        }))
      });
    }

    console.log('✅ Schema analysis complete!');
    return schema;

  } catch (error) {
    console.error('❌ Error getting complete schema:', error);
    throw error;
  }
}

/**
 * Infer table description from table name
 * 
 * @param {string} tableName - Name of the table
 * @returns {string} Inferred description
 */
function inferTableDescription(tableName) {
  const descriptions = {
    'users': 'User accounts and profile information',
    'customers': 'Customer information and contact details',
    'sales': 'Sales transactions and order records',
    'orders': 'Customer orders and purchase history',
    'products': 'Product catalog and inventory',
    'items': 'Product items and SKUs',
    'inventory': 'Stock levels and warehouse data',
    'employees': 'Employee records and HR information',
    'payments': 'Payment transactions and billing records',
    'invoices': 'Invoice records and billing details',
    'categories': 'Product or content categories',
    'reviews': 'Customer reviews and ratings',
    'comments': 'User comments and feedback',
    'posts': 'Blog posts or content entries',
    'articles': 'Article content and metadata'
  };

  // Remove common prefixes/suffixes
  const cleanName = tableName.replace(/^(tbl_|tb_)/, '').replace(/(_table|s)$/, '');
  
  return descriptions[cleanName] || descriptions[tableName] || 
         `${tableName.charAt(0).toUpperCase() + tableName.slice(1)} data`;
}

/**
 * Infer column description from column name and type
 * 
 * @param {string} columnName - Name of the column
 * @param {string} dataType - Data type of the column
 * @returns {string} Inferred description
 */
function inferColumnDescription(columnName, dataType) {
  // Common patterns
  const patterns = {
    'id': 'Unique identifier',
    '_id': 'Foreign key reference',
    'name': 'Name field',
    'email': 'Email address',
    'phone': 'Phone number',
    'address': 'Physical address',
    'city': 'City name',
    'state': 'State or province',
    'country': 'Country name',
    'zip': 'Postal code',
    'postal_code': 'Postal code',
    'date': 'Date value',
    'created_at': 'Record creation timestamp',
    'updated_at': 'Last update timestamp',
    'deleted_at': 'Soft delete timestamp',
    'price': 'Price amount',
    'cost': 'Cost amount',
    'amount': 'Monetary amount',
    'quantity': 'Quantity value',
    'status': 'Status indicator',
    'type': 'Type or category',
    'description': 'Descriptive text',
    'notes': 'Additional notes',
    'is_': 'Boolean flag',
    'has_': 'Boolean indicator'
  };

  // Check for exact matches
  for (const [pattern, description] of Object.entries(patterns)) {
    if (columnName === pattern || columnName.endsWith(pattern)) {
      return description;
    }
  }

  // Check for contains
  if (columnName.includes('_id') || columnName.endsWith('_id')) {
    return `Foreign key to ${columnName.replace('_id', '')} table`;
  }

  if (columnName.startsWith('is_') || columnName.startsWith('has_')) {
    return `Boolean: ${columnName.replace(/^(is_|has_)/, '').replace(/_/g, ' ')}`;
  }

  if (dataType === 'TIMESTAMP' || dataType === 'DATE') {
    return `Date/time: ${columnName.replace(/_/g, ' ')}`;
  }

  if (dataType === 'BOOLEAN') {
    return `Boolean flag: ${columnName.replace(/_/g, ' ')}`;
  }

  return columnName.replace(/_/g, ' ');
}

/**
 * Cache for schema to avoid repeated database queries
 * Cache expires after 1 hour
 */
let schemaCache = null;
let schemaCacheTime = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Get schema with caching
 * 
 * @param {boolean} forceRefresh - Force refresh the cache
 * @returns {Promise<Object>} Complete database schema
 */
export async function getCachedSchema(forceRefresh = false) {
  const now = Date.now();

  // Return cached schema if valid and not forcing refresh
  if (!forceRefresh && schemaCache && schemaCacheTime && 
      (now - schemaCacheTime) < CACHE_DURATION) {
    console.log('📦 Using cached schema');
    return schemaCache;
  }

  // Fetch fresh schema
  console.log('🔄 Refreshing schema cache...');
  schemaCache = await getCompleteSchema();
  schemaCacheTime = now;

  return schemaCache;
}

/**
 * Clear schema cache (useful after database migrations)
 */
export function clearSchemaCache() {
  schemaCache = null;
  schemaCacheTime = null;
  console.log('🗑️  Schema cache cleared');
}

/**
 * Get sample data from a table (for LLM context)
 * 
 * @param {string} tableName - Name of the table
 * @param {number} limit - Number of sample rows (default: 3)
 * @returns {Promise<Array>} Sample rows
 */
export async function getSampleData(tableName, limit = 3) {
  try {
    const query = `SELECT * FROM ${tableName} LIMIT ${limit}`;
    const data = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
    return data;
  } catch (error) {
    console.error(`Error fetching sample data from ${tableName}:`, error);
    return [];
  }
}

/**
 * Validate if a table exists in the database
 * 
 * @param {string} tableName - Name of the table to check
 * @returns {Promise<boolean>} True if table exists
 */
export async function tableExists(tableName) {
  try {
    const tables = await getAllTables();
    return tables.includes(tableName);
  } catch (error) {
    console.error('Error checking table existence:', error);
    return false;
  }
}

/**
 * Get statistics about the database
 * 
 * @returns {Promise<Object>} Database statistics
 */
export async function getDatabaseStats() {
  try {
    const tables = await getAllTables();
    const stats = {
      totalTables: tables.length,
      tables: []
    };

    for (const tableName of tables) {
      const countQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
      const result = await sequelize.query(countQuery, {
        type: QueryTypes.SELECT
      });

      stats.tables.push({
        name: tableName,
        rowCount: parseInt(result[0].count)
      });
    }

    return stats;
  } catch (error) {
    console.error('Error getting database stats:', error);
    throw error;
  }
}
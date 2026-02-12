// utils/databaseSchema.js
// Database schema utilities - NOW FETCHES VIA EXTERNAL API

import { fetchSchemaFromApi } from '../services/externalApiClient.js';

// Schema cache
let schemaCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached schema or fetch from external API
 * @param {boolean} forceRefresh - Force refresh the cache
 * @returns {Promise<Object>} Database schema
 */
export async function getCachedSchema(forceRefresh = false) {
  const now = Date.now();
  
  // Check if cache is valid
  if (
    !forceRefresh &&
    schemaCache &&
    cacheTimestamp &&
    (now - cacheTimestamp) < CACHE_TTL
  ) {
    console.log('📦 Using cached schema');
    return schemaCache;
  }

  console.log('🔄 Fetching schema from external API...');
  
  try {
    // Fetch schema from external API
    const schema = await fetchSchemaFromApi(forceRefresh);
    
    // Update cache
    schemaCache = schema;
    cacheTimestamp = now;
    
    console.log(`✅ Schema cached: ${schema.tables?.length || 0} tables`);
    return schema;
    
  } catch (error) {
    console.error('❌ Failed to fetch schema from API:', error.message);
    
    // Return stale cache if available
    if (schemaCache) {
      console.warn('⚠️ Using stale schema cache');
      return schemaCache;
    }
    
    throw error;
  }
}

/**
 * Clear the schema cache
 */
export function clearSchemaCache() {
  schemaCache = null;
  cacheTimestamp = null;
  console.log('🗑️ Schema cache cleared');
}

/**
 * Get schema cache status
 * @returns {Object} Cache status
 */
export function getSchemaCacheStatus() {
  return {
    cached: !!schemaCache,
    timestamp: cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null,
    age: cacheTimestamp ? Date.now() - cacheTimestamp : null,
    ttl: CACHE_TTL,
    tableCount: schemaCache?.tables?.length || 0
  };
}
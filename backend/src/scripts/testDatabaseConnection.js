// scripts/testDatabaseConnection.js
// Script to test database connection

import dotenv from 'dotenv';
import { testConnection, getDatabaseMetadata, fetchDatabaseSchema } from '../services/databaseServiceDirect.js';

dotenv.config();

async function main() {
  console.log('🔍 Database Connection Test');
  console.log('='.repeat(60));
  console.log('');

  console.log('📋 Configuration:');
  console.log(`   Dialect: ${process.env.DB_DIALECT || 'postgres'}`);
  console.log(`   Host:    ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Port:    ${process.env.DB_PORT || '5432'}`);
  console.log(`   Database: ${process.env.DB_NAME || '(not set)'}`);
  console.log(`   User:     ${process.env.DB_USER || '(not set)'}`);
  console.log('');

  try {
    // Test 1: Basic connection
    console.log('🧪 Test 1: Testing connection...');
    const connectionResult = await testConnection();
    console.log(`   ✅ ${connectionResult.message}`);
    console.log('');

    // Test 2: Get metadata
    console.log('🧪 Test 2: Fetching database metadata...');
    const metadata = await getDatabaseMetadata();
    console.log(`   ✅ Database: ${metadata.database}`);
    console.log(`   ✅ Dialect:  ${metadata.dialect}`);
    console.log(`   ✅ Version:  ${metadata.version}`);
    console.log('');

    // Test 3: Fetch schema
    console.log('🧪 Test 3: Fetching database schema...');
    const schema = await fetchDatabaseSchema();
    console.log(`   ✅ Found ${schema.tables.length} tables:`);
    
    schema.tables.forEach(table => {
      console.log(`      - ${table.name} (${table.columns.length} columns)`);
    });
    console.log('');

    // Test 4: Sample query
    if (schema.tables.length > 0) {
      const firstTable = schema.tables[0].name;
      console.log(`🧪 Test 4: Running sample query on "${firstTable}"...`);
      
      const { executeQuery } = await import('../services/databaseServiceDirect.js');
      const results = await executeQuery(`SELECT * FROM ${firstTable} LIMIT 5`);
      
      console.log(`   ✅ Query successful: ${results.length} rows returned`);
      if (results.length > 0) {
        console.log(`   ✅ Sample columns: ${Object.keys(results[0]).join(', ')}`);
      }
      console.log('');
    }

    console.log('='.repeat(60));
    console.log('✅ All tests passed!');
    console.log('='.repeat(60));
    console.log('');
    console.log('🎉 Your database is properly configured and ready to use.');
    console.log('');

    process.exit(0);

  } catch (error) {
    console.log('');
    console.log('='.repeat(60));
    console.log('❌ Connection test failed');
    console.log('='.repeat(60));
    console.log('');
    console.error('Error:', error.message);
    console.log('');
    console.log('Troubleshooting:');
    console.log('   1. Check your .env file configuration');
    console.log('   2. Verify database server is running');
    console.log('   3. Ensure firewall allows connection');
    console.log('   4. Check database user permissions');
    console.log('   5. For SSL issues, set DB_SSL=false for local testing');
    console.log('');

    process.exit(1);
  }
}

main();
// controllers/aiChartController.js
// ONLY THIS FILE NEEDS TO BE UPDATED

import { saveWidget, getLastWidget } from '../services/widgetService.js';
import { beautifyVegaSpec, snakeToTitle } from '../utils/labelFormatter.js';
import { getCachedSchema } from '../utils/databaseSchema.js';
import { generateChartWithAI } from '../services/aiService.js';
import { executeQuery, validateQuery } from '../services/databaseService.js';
import {
  validateVegaSpec,
  enhanceVegaSpec,
  generateChartSummary,
  suggestAlternativeCharts
} from '../services/chartService.js';
import { validatePrompt } from '../utils/validation.js';
import { transformDataKeys } from '../utils/dataTransformer.js'; // ✅ ADD THIS IMPORT

export const generateChartFromPrompt = async (req, res) => {
  const startTime = Date.now();

  try {
    const { prompt, isNew = true, widgetId = null, options = {} } = req.body;

    console.log('📝 Request:', { prompt, isNew, widgetId });

    // 1️⃣ Validate prompt
    const promptValidation = validatePrompt(prompt);
    if (!promptValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid prompt',
        errors: promptValidation.errors
      });
    }

    // 2️⃣ Load DB schema
    const schema = await getCachedSchema();

    // 3️⃣ Generate SQL + Vega via AI
    const aiResponse = await generateChartWithAI(prompt, schema);

    const widgetName = aiResponse.widgetName?.trim() || 
      `Chart - ${prompt.slice(0, 40)}${prompt.length > 40 ? '...' : ''}`;

    // 4️⃣ Validate SQL
    const sqlValidation = validateQuery(aiResponse.sqlQuery, schema);
    if (!sqlValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Generated SQL is invalid',
        errors: sqlValidation.errors
      });
    }

    // 5️⃣ Execute SQL
    console.log('💾 Executing SQL query...');
    const rawData = await executeQuery(aiResponse.sqlQuery, {
      timeout: options.timeout || 30000,
      maxRows: options.maxRows || 10000
    });

    // 6️⃣ Normalize data
    const normalizedData = rawData.map(row => {
      const normalized = { ...row };
      for (const key in normalized) {
        const value = normalized[key];
        if (typeof value === 'string' && value.trim() !== '' && !isNaN(value)) {
          normalized[key] = Number(value);
        }
      }
      return normalized;
    });

    const executionTime = Date.now() - startTime;

    // 7️⃣ Empty result handling
    if (normalizedData.length === 0) {
      return res.status(200).json({
        success: true,
        prompt,
        dataCount: 0,
        data: [],
        executionTime,
        vegaSpec: {
          $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
          mark: 'text',
          data: { values: [] },
          title: 'No data available'
        }
      });
    }

    // ✅ TRANSFORM DATA KEYS TO TITLE CASE FOR UI
    const displayData = transformDataKeys(normalizedData);

    // 8️⃣ Enhance Vega spec with TRANSFORMED data
    const vegaValidation = validateVegaSpec(aiResponse.vegaSpec);
    if (!vegaValidation.valid) {
      console.warn('⚠️ Vega spec validation failed:', vegaValidation.errors);
    }

    // Update Vega spec field names to match transformed data
    const updatedVegaSpec = updateVegaSpecFields(aiResponse.vegaSpec, normalizedData);

    const enhancedVegaSpec = enhanceVegaSpec(
      updatedVegaSpec,
      displayData, // ✅ Use transformed data
      options.chartOptions || {}
    );

    const beautifiedVegaSpec = beautifyVegaSpec(enhancedVegaSpec);

    const analysis = normalizeAnalysis(aiResponse.analysis, normalizedData);
    const summary = generateChartSummary(normalizedData, analysis);
    const alternatives = suggestAlternativeCharts(normalizedData, analysis);

    saveWidget({
      isNew,
      widgetId,
      name: widgetName,
      prompt,
      sqlQuery: aiResponse.sqlQuery,
      vegaSpec: beautifiedVegaSpec,
      analysis: aiResponse.analysis
    });

    // 🔟 Return response with transformed data
    res.status(200).json({
      success: true,
      prompt,
      analysis,
      dataCount: displayData.length, // ✅ Use displayData length
      data: displayData,              // ✅ Return transformed data
      vegaSpec: beautifiedVegaSpec,
      executionTime,
      summary,
      alternatives,
      explanation: aiResponse.explanation
    });

  } catch (error) {
    console.error('❌ Error generating chart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate chart',
      error: error.message,
      executionTime: Date.now() - startTime
    });
  }
};

function normalizeAnalysis(analysis, data) {
  const sample = data[0] || {};
  const numericCols = Object.keys(sample).filter(
    k => typeof sample[k] === 'number'
  );

  return {
    ...analysis,
    groupByField: analysis.groupBy,
    groupByLabel: snakeToTitle(analysis.groupBy),
    valueField: numericCols[0] || null,
    valueLabel: snakeToTitle(numericCols[0])
  };
}

/**
 * Update Vega spec field names to match transformed data
 * Converts snake_case field names to Title Case
 */
function updateVegaSpecFields(vegaSpec, originalData) {
  if (!vegaSpec.encoding || !originalData.length) {
    return vegaSpec;
  }

  const spec = JSON.parse(JSON.stringify(vegaSpec)); // Deep clone

  // Update encoding field names
  Object.keys(spec.encoding).forEach(channel => {
    const encoding = spec.encoding[channel];
    if (encoding.field) {
      // Convert snake_case to Title Case
      encoding.field = snakeToTitle(encoding.field.toLowerCase());
    }
  });

  // Update tooltip field names if present
  if (spec.encoding.tooltip && Array.isArray(spec.encoding.tooltip)) {
    spec.encoding.tooltip = spec.encoding.tooltip.map(t => ({
      ...t,
      field: snakeToTitle(t.field.toLowerCase())
    }));
  }

  return spec;
}


/**
 * Get example prompts based on database schema
 * 
 * @route GET /api/ai-chart/examples
 */
export const getPromptExamples = async (req, res) => {
  try {
    const schema = await getCachedSchema();
    const tableNames = schema.tables.map(t => t.name);

    const examples = {
      basic: [
        `Show all data from ${tableNames[0] || 'your_table'}`,
        `Count records in ${tableNames[0] || 'your_table'}`,
        'List all available tables'
      ],
      aggregation: [
        'Show total and average by category',
        'Find top 10 records by value',
        'Group by category and sum values'
      ],
      timeAnalysis: [
        'Show monthly trend',
        'Compare this year vs last year',
        'Daily breakdown for last 30 days'
      ],
      multiTable: tableNames.length > 1 ? [
        `Join ${tableNames[0]} with ${tableNames[1]}`,
        'Show relationships between tables',
        'Compare data across tables'
      ] : []
    };

    // Add table-specific examples
    tableNames.forEach(tableName => {
      examples[tableName] = [
        `Show all ${tableName}`,
        `Count ${tableName} by category`,
        `Top 10 ${tableName} by value`
      ];
    });

    res.status(200).json({
      success: true,
      database: schema.database,
      dialect: schema.dialect,
      availableTables: tableNames,
      tableCount: tableNames.length,
      examples,
      tips: [
        "Ask naturally - the AI understands your database",
        "Reference tables and columns by name",
        "Use time phrases: 'last month', 'this year'",
        "Request comparisons: 'compare X vs Y'",
        "Specify limits: 'top 5', 'bottom 10'",
        "Choose chart types: 'as a line chart'",
        "The AI handles joins automatically"
      ]
    });

  } catch (error) {
    console.error('❌ Error getting examples:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate examples',
      error: error.message
    });
  }
};

/**
 * Get database schema information
 * 
 * @route GET /api/ai-chart/schema
 * @query refresh - Force refresh cache
 */
export const getDatabaseSchemaInfo = async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const schema = await getCachedSchema(forceRefresh);

    res.status(200).json({
      success: true,
      schema,
      cached: !forceRefresh,
      message: 'Database schema retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching schema:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch database schema',
      error: error.message
    });
  }
};

/**
 * Refresh schema cache
 * 
 * @route POST /api/ai-chart/schema/refresh
 */
export const refreshSchemaCache = async (req, res) => {
  try {
    clearSchemaCache();
    const schema = await getCachedSchema(true);

    res.status(200).json({
      success: true,
      message: 'Schema cache refreshed successfully',
      tableCount: schema.tables.length,
      tables: schema.tables.map(t => ({
        name: t.name,
        columnCount: t.columns.length
      }))
    });

  } catch (error) {
    console.error('❌ Error refreshing schema:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh schema cache',
      error: error.message
    });
  }
};

/**
 * Get database statistics
 * 
 * @route GET /api/ai-chart/stats
 */
export const getDatabaseStatistics = async (req, res) => {
  try {
    const stats = await getDatabaseStats();
    const metadata = await getDatabaseMetadata();

    res.status(200).json({
      success: true,
      statistics: stats,
      metadata
    });

  } catch (error) {
    console.error('❌ Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get database statistics',
      error: error.message
    });
  }
};

/**
 * Test AI connection
 * 
 * @route GET /api/ai-chart/test-ai
 */
export const testAIConnection = async (req, res) => {
  try {
    const result = await testOpenAIConnection();
    const modelInfo = getModelInfo();

    res.status(200).json({
      success: true,
      ...result,
      modelInfo
    });

  } catch (error) {
    console.error('❌ AI test failed:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      hint: error.message.includes('authentication') 
        ? 'Check your OPENAI_API_KEY in .env file'
        : 'Check your internet connection and OpenAI service status'
    });
  }
};

/**
 * Test database connection
 * 
 * @route GET /api/ai-chart/test-db
 */
export const testDatabaseConnection = async (req, res) => {
  try {
    const result = await testConnection();

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      hint: 'Check your database configuration in .env file'
    });
  }
};

/**
 * Export chart data in different formats
 * 
 * @route POST /api/ai-chart/export
 * @body { data: Array, format: string }
 */
export const exportChartData = async (req, res) => {
  try {
    const { data, format = 'json' } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: 'Data must be an array'
      });
    }

    const converted = convertChartData(data, format);

    // Set appropriate content type
    const contentTypes = {
      json: 'application/json',
      csv: 'text/csv',
      tsv: 'text/tab-separated-values'
    };

    res.setHeader('Content-Type', contentTypes[format] || 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=chart-data.${format}`);
    res.send(converted);

  } catch (error) {
    console.error('❌ Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
};

/**
 * Get health status of the service
 * 
 * @route GET /api/ai-chart/health
 */
export const getHealthStatus = async (req, res) => {
  try {
    const [dbTest, aiTest, schema] = await Promise.allSettled([
      testConnection(),
      testOpenAIConnection(),
      getCachedSchema()
    ]);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      components: {
        database: {
          status: dbTest.status === 'fulfilled' ? 'up' : 'down',
          details: dbTest.status === 'fulfilled' ? dbTest.value : dbTest.reason?.message
        },
        ai: {
          status: aiTest.status === 'fulfilled' ? 'up' : 'down',
          details: aiTest.status === 'fulfilled' ? aiTest.value : aiTest.reason?.message
        },
        schema: {
          status: schema.status === 'fulfilled' ? 'up' : 'down',
          tableCount: schema.status === 'fulfilled' ? schema.value.tables.length : 0
        }
      }
    };

    // Overall status
    const allUp = Object.values(health.components).every(c => c.status === 'up');
    health.status = allUp ? 'healthy' : 'degraded';

    const statusCode = allUp ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
};

/**
 * Helper function to get appropriate error hint
 * 
 * @param {Error} error - Error object
 * @returns {string} Error hint
 */
function getErrorHint(error) {
  const message = error.message.toLowerCase();

  if (message.includes('authentication') || message.includes('api key')) {
    return 'Check your OpenAI API key in .env file';
  }

  if (message.includes('database') || message.includes('sql')) {
    return 'Check your database connection and query syntax';
  }

  if (message.includes('timeout')) {
    return 'Query took too long. Try adding filters to reduce data size';
  }

  if (message.includes('table') || message.includes('column')) {
    return 'Referenced table or column may not exist. Check your database schema';
  }

  return 'Try rephrasing your prompt or check the server logs for details';
}

// Add new endpoint:
/**
 * Get last saved widget
 * @route GET /api/widgets/last
 */
export const getLastSavedWidget = async (req, res) => {
  try {
    const widget = await getLastWidget();
    
    if (!widget) {
      return res.status(404).json({ success: false, message: 'No widgets found' });
    }

    res.json({
      success: true,
      widget: {
        id: widget.id,
        prompt: widget.prompt,
        sqlQuery: widget.sqlQuery,
        vegaSpec: widget.vegaSpec,
        analysis: widget.analysis
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
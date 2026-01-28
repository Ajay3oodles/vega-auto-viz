// services/aiService.js
// Service layer for OpenAI API interactions
// Handles all AI-related business logic

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate SQL query and Vega-Lite spec from natural language prompt
 * 
 * @param {string} userPrompt - User's natural language query
 * @param {Object} schema - Database schema object
 * @returns {Promise<Object>} AI response with SQL and Vega spec
 */
export async function generateChartWithAI(userPrompt, schema) {
  try {
    const systemPrompt = buildSystemPrompt(schema);
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2, // Low temperature for consistent SQL
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content;
    const parsedResponse = JSON.parse(responseText);
    
    // Validate response structure
    validateAIResponse(parsedResponse);

    // Log token usage for cost monitoring
    logTokenUsage(completion.usage);

    return {
      ...parsedResponse,
      tokensUsed: completion.usage.total_tokens
    };

  } catch (error) {
    console.error('❌ AI Service Error:', error);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

/**
 * Build system prompt with database schema context
 * 
 * @param {Object} schema - Database schema
 * @returns {string} System prompt for OpenAI
 */
function buildSystemPrompt(schema) {
  const schemaDescription = formatSchemaForAI(schema);

  return `You are an expert data analyst and SQL query generator for a ${schema.dialect.toUpperCase()} database.

DATABASE SCHEMA:
${schemaDescription}

Your job is to:
1. Understand the user's natural language request
2. Generate a valid ${schema.dialect.toUpperCase()} SQL query to fetch the required data
3. Create a Vega-Lite visualization specification

IMPORTANT RULES:
- Generate ONLY valid ${schema.dialect.toUpperCase()} syntax
- Use ONLY tables and columns that exist in the schema above
- Always filter out NULL values in GROUP BY columns using WHERE clause
- Use appropriate aggregations (SUM, AVG, COUNT, MAX, MIN)
- Column aliases should be simple (no spaces, lowercase with underscores)
- For PostgreSQL date grouping: TO_CHAR(date_column, 'YYYY-MM') AS month
- For MySQL date grouping: DATE_FORMAT(date_column, '%Y-%m') AS month
- LIMIT results to reasonable numbers (default 20, max 100)
- Choose appropriate chart types based on data and intent
- When joining tables, use proper JOIN syntax with ON conditions

CHART TYPE SELECTION:
- bar: Comparing categories, rankings, distributions
- line: Trends over time, continuous data
- arc (pie): Part-to-whole relationships, percentages
- point (scatter): Correlation between two variables
- area: Cumulative values over time

RESPONSE FORMAT:
Return a valid JSON object with this structure:
{
  "analysis": {
    "intent": "what user wants to see",
    "tablesUsed": ["table1", "table2"],
    "chartType": "bar|line|arc|point|area",
    "aggregation": "sum|avg|count|max|min|none",
    "groupBy": "column name or null",
    "filters": "description of filters"
  },
  "sqlQuery": "complete SQL query string",
  "vegaSpec": {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "chart description",
    "width": 700,
    "height": 400,
    "data": {"values": []},
    "mark": {"type": "bar", "tooltip": true},
    "encoding": {
      "x": {"field": "x_column", "type": "nominal|temporal|quantitative"},
      "y": {"field": "y_column", "type": "quantitative"}
    }
  },
  "explanation": "brief explanation of the query and visualization"
}

CRITICAL: vegaSpec data field must be {"values": []} and encoding field names must match SQL column aliases.`;
}

/**
 * Format database schema for AI consumption
 * 
 * @param {Object} schema - Database schema
 * @returns {string} Formatted schema description
 */
function formatSchemaForAI(schema) {
  let formatted = `Database: ${schema.database} (${schema.dialect})\n`;
  formatted += `Total Tables: ${schema.tables.length}\n\n`;

  schema.tables.forEach(table => {
    formatted += `TABLE: ${table.name}\n`;
    formatted += `Description: ${table.description}\n`;
    formatted += `Columns:\n`;

    table.columns.forEach(col => {
      const nullable = col.nullable ? 'NULL' : 'NOT NULL';
      formatted += `  - ${col.name} (${col.type}, ${nullable})`;
      if (col.description) {
        formatted += ` - ${col.description}`;
      }
      formatted += '\n';
    });

    if (table.relationships && table.relationships.length > 0) {
      formatted += `Relationships:\n`;
      table.relationships.forEach(rel => {
        formatted += `  - ${rel.column} -> ${rel.foreignTable}.${rel.foreignColumn}\n`;
      });
    }

    formatted += '\n';
  });

  return formatted;
}

/**
 * Validate AI response structure
 * 
 * @param {Object} response - Parsed AI response
 * @throws {Error} If response is invalid
 */
function validateAIResponse(response) {
  if (!response.sqlQuery) {
    throw new Error('AI response missing sqlQuery field');
  }

  if (!response.vegaSpec) {
    throw new Error('AI response missing vegaSpec field');
  }

  if (!response.analysis) {
    throw new Error('AI response missing analysis field');
  }

  if (!response.vegaSpec.encoding) {
    throw new Error('Vega spec missing encoding field');
  }
}

/**
 * Log token usage for monitoring
 * 
 * @param {Object} usage - Token usage from OpenAI
 */
function logTokenUsage(usage) {
  console.log('💰 Token Usage:', {
    prompt: usage.prompt_tokens,
    completion: usage.completion_tokens,
    total: usage.total_tokens,
    estimatedCost: calculateCost(usage.total_tokens)
  });
}

/**
 * Calculate estimated cost based on token usage
 * 
 * @param {number} totalTokens - Total tokens used
 * @returns {string} Estimated cost in USD
 */
function calculateCost(totalTokens) {
  // GPT-4o-mini pricing (as of 2024)
  const costPer1MTokens = 0.15; // Input + Output average
  const cost = (totalTokens / 1000000) * costPer1MTokens;
  return `$${cost.toFixed(6)}`;
}

/**
 * Test OpenAI connection
 * 
 * @returns {Promise<Object>} Test result
 */
export async function testOpenAIConnection() {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: 'Respond with "OK" if you can read this.' }
      ],
      max_tokens: 10
    });

    return {
      success: true,
      message: 'OpenAI connection successful',
      response: completion.choices[0].message.content,
      model: completion.model
    };

  } catch (error) {
    throw new Error(`OpenAI connection failed: ${error.message}`);
  }
}

/**
 * Get AI model information
 * 
 * @returns {Object} Current model configuration
 */
export function getModelInfo() {
  return {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    provider: 'OpenAI',
    features: [
      'Natural language to SQL',
      'Chart type selection',
      'Dynamic schema understanding',
      'Multi-table joins',
      'Complex aggregations'
    ]
  };
}
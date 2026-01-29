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

  return `
You are an expert data analyst, SQL generator, and Vega-Lite chart author for a ${schema.dialect.toUpperCase()} database.

DATABASE SCHEMA:
${schemaDescription}

━━━━━━━━━━━━━━━━━━━━━━
YOUR RESPONSIBILITIES
━━━━━━━━━━━━━━━━━━━━━━
1. Understand the user's intent
2. Generate a VALID ${schema.dialect.toUpperCase()} SQL query
3. Generate a CORRECT Vega-Lite v5 specification that accurately represents the query result

━━━━━━━━━━━━━━━━━━━━━━
SQL RULES (STRICT)
━━━━━━━━━━━━━━━━━━━━━━
- Use ONLY tables and columns from the schema
- Generate ONLY valid ${schema.dialect.toUpperCase()} syntax
- Always filter out NULL values for GROUP BY columns using WHERE
- Use appropriate aggregations (SUM, AVG, COUNT, MIN, MAX)
- Column aliases:
  - lowercase
  - snake_case
  - no spaces
- Always alias aggregated columns
- Use explicit JOIN ... ON syntax
- Limit results:
  - default LIMIT 20
  - maximum LIMIT 100

DATE GROUPING:
- PostgreSQL:
  - Monthly: TO_CHAR(date_column, 'YYYY-MM') AS month
  - Yearly: EXTRACT(YEAR FROM date_column) AS year
- MySQL:
  - Monthly: DATE_FORMAT(date_column, '%Y-%m') AS month
  - Yearly: YEAR(date_column) AS year

━━━━━━━━━━━━━━━━━━━━━━
CHART TYPE SELECTION
━━━━━━━━━━━━━━━━━━━━━━
- bar: category comparison, ranking, grouped totals
- line: trends over time (ordered sequence)
- area: cumulative trends
- arc (pie): part-to-whole (≤ 6 categories only)
- point (scatter): correlation between two numeric fields

━━━━━━━━━━━━━━━━━━━━━━
VEGA-LITE RULES (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━
- Use Vega-Lite schema v5 ONLY
- Vega encoding field names MUST exactly match SQL column aliases
- Y-axis numeric measures MUST be "quantitative"

TEMPORAL AXIS RULES (VERY IMPORTANT):
- Use "temporal" ONLY when the field is:
  - a DATE or TIMESTAMP column
  - or a full date string (YYYY-MM-DD)
- If the data is aggregated by:
  - month (YYYY-MM)
  - year (YYYY)
  → the x-axis MUST be "ordinal", NOT "temporal"
- NEVER invent timeUnit unless raw date exists
- If unsure, prefer "ordinal" over "temporal"
- Ordinal time buckets MUST be sorted ascending

CATEGORY RULES:
- Textual categories → "nominal"
- Numeric values → "quantitative"
- Categories are NEVER temporal

━━━━━━━━━━━━━━━━━━━━━━
RESPONSE FORMAT (JSON ONLY)
━━━━━━━━━━━━━━━━━━━━━━
Return a single valid JSON object with the following structure:

{
  "analysis": {
    "intent": "clear description of user goal",
    "tablesUsed": ["table1", "table2"],
    "chartType": "bar | line | area | arc | point",
    "aggregation": "sum | avg | count | min | max | none",
    "groupBy": "column name or null",
    "filters": "human-readable filter summary"
  },
  "sqlQuery": "FULL SQL QUERY STRING",
  "vegaSpec": {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "short chart description",
    "width": 700,
    "height": 400,
    "data": { "values": [] },
    "mark": {
      "type": "bar | line | area | arc | point",
      "tooltip": true
    },
    "encoding": {
      "x": {
        "field": "x_column_alias",
        "type": "nominal | ordinal | temporal | quantitative",
        "sort": "ascending"
      },
      "y": {
        "field": "y_column_alias",
        "type": "quantitative"
      }
    }
  },
  "explanation": "brief explanation of SQL + chart choice"
}

CRITICAL CONSTRAINTS:
- Do NOT include actual data in Vega-Lite (values must be empty)
- Do NOT add commentary outside JSON
- Do NOT guess columns or tables
- Do NOT use temporal axis for aggregated months or years
`;
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
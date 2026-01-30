// services/aiService.js
// Service layer for OpenAI API interactions
// Handles all AI-related business logic

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate SQL query and Vega-Lite specification from natural language prompt
 * 
 * @param {string} userPrompt - User's natural language query
 * @param {Object} schema - Database schema object
 * @returns {Promise<Object>} AI response containing SQL query and Vega-Lite spec
 * @throws {Error} If AI generation fails
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
      temperature: 0.2, // Low temperature for consistent SQL generation
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content;
    const parsedResponse = JSON.parse(responseText);
    
    // Validate the response structure
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
 * Build comprehensive system prompt with database schema context
 * 
 * @param {Object} schema - Database schema object
 * @returns {string} Formatted system prompt for OpenAI
 */
function buildSystemPrompt(schema) {
  const schemaDescription = formatSchemaForAI(schema);

  return `You are an expert data analyst, SQL generator, and Vega-Lite chart author for a ${schema.dialect.toUpperCase()} database.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATABASE SCHEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${schemaDescription}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR RESPONSIBILITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Understand the user's intent from their natural language query
2. Generate a valid ${schema.dialect.toUpperCase()} SQL query to fetch the required data
3. Create a correct Vega-Lite v5 specification to visualize the data

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SQL GENERATION RULES (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCHEMA COMPLIANCE:
• Use ONLY tables and columns explicitly listed in the schema above
• NEVER invent or assume tables that don't exist (e.g., "daily_sales", "monthly_revenue")
• NEVER guess column names - use exact names from the schema
• All aggregations must be computed from base tables

SYNTAX REQUIREMENTS:
• Generate valid ${schema.dialect.toUpperCase()} syntax only
• Always filter out NULL values in GROUP BY columns using WHERE clause
• Use appropriate aggregate functions: SUM, AVG, COUNT, MIN, MAX
• Use explicit JOIN ... ON syntax for multi-table queries

COLUMN NAMING:
• All column aliases must be in snake_case (lowercase with underscores)
• No spaces in column names
• Always alias aggregated columns (e.g., "SUM(amount) AS total_amount")

DATE HANDLING:
• PostgreSQL monthly grouping: TO_CHAR(date_column, 'YYYY-MM') AS month
• PostgreSQL yearly grouping: EXTRACT(YEAR FROM date_column) AS year
• MySQL monthly grouping: DATE_FORMAT(date_column, '%Y-%m') AS month
• MySQL yearly grouping: YEAR(date_column) AS year

RESULT LIMITS:
• Default: LIMIT 20
• Maximum: LIMIT 100
• Use LIMIT unless user explicitly requests more

WINDOW FUNCTIONS:
• Ensure all parentheses are properly balanced
• Avoid overly nested expressions
• Use clear, readable formatting for complex calculations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHART TYPE SELECTION GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Choose the appropriate chart type based on data characteristics:

• bar: Comparing categories, rankings, grouped totals
• line: Showing trends over time (requires ordered sequence)
• area: Displaying cumulative trends over time
• arc (pie): Part-to-whole relationships (use ONLY for ≤ 6 categories)
• point (scatter): Showing correlation between two numeric variables

IMPORTANT: For year-over-year comparisons or calculations that produce NULL values for the first period, prefer "point" over "line" if fewer than 2 non-null data points exist.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VEGA-LITE SPECIFICATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL REQUIREMENTS:
• Use Vega-Lite schema v5 ONLY: "https://vega.github.io/schema/vega-lite/v5.json"
• Field names in encoding MUST exactly match SQL column aliases
• The "values" array in data MUST be empty: {"values": []}
• Numeric measures on Y-axis MUST use "quantitative" type

AXIS TYPE SELECTION (VERY IMPORTANT):

For X-axis (horizontal):
• "temporal" - ONLY when field contains full date/timestamp (YYYY-MM-DD or timestamp)
• "ordinal" - For aggregated time buckets (YYYY-MM, YYYY) or ordered categories
• "nominal" - For unordered text categories
• "quantitative" - For continuous numeric values

For Y-axis (vertical):
• "quantitative" - For all numeric measures (sums, averages, counts, etc.)

TIME AGGREGATION RULE:
• If data is grouped by month (YYYY-MM) or year (YYYY), use "ordinal" NOT "temporal"
• Only use "temporal" for raw date/timestamp columns
• When using ordinal for time, add: "sort": "ascending"

NULL VALUE HANDLING:
• For metrics that can produce NULL (e.g., growth percentages), add transform filter:
  {"filter": "datum.field_name != null"}
• If fewer than 2 non-null points remain, use "point" instead of "line"

CHART REQUIREMENTS BY TYPE:
• Line charts: Require at least 2 non-null data points
• Pie charts: Use only when categories ≤ 6
• All charts: Include tooltip for interactivity

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER INTERFACE GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Axis labels and titles: Convert snake_case to Title Case
  Example: "total_amount" → "Total Amount"
• Chart description: Use clear, concise language
• Keep field names in encoding as snake_case (matching SQL aliases)
• NEVER show underscores in user-facing labels

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE FORMAT (STRICT JSON)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY a valid JSON object with NO additional text, markdown, or code blocks:

{
  "analysis": {
    "intent": "Clear description of what the user wants to see",
    "tablesUsed": ["table_name_1", "table_name_2"],
    "chartType": "bar | line | area | arc | point",
    "aggregation": "sum | avg | count | min | max | none",
    "groupBy": "column_name_or_null",
    "filters": "Human-readable description of any filters applied"
  },
  "sqlQuery": "Complete SQL query as a single string",
  "vegaSpec": {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "Brief description of the chart",
    "width": 700,
    "height": 400,
    "data": {"values": []},
    "mark": {
      "type": "bar",
      "tooltip": true
    },
    "encoding": {
      "x": {
        "field": "column_alias_from_sql",
        "type": "nominal | ordinal | temporal | quantitative",
        "axis": {"title": "Display Title"},
        "sort": "ascending"
      },
      "y": {
        "field": "column_alias_from_sql",
        "type": "quantitative",
        "axis": {"title": "Display Title"}
      }
    }
  },
  "explanation": "Brief explanation of the SQL logic and chart choice"
}

CRITICAL REMINDERS:
• Do NOT include actual data in vegaSpec (values must be empty array)
• Do NOT add commentary, preamble, or markdown formatting
• Do NOT guess or invent tables/columns not in the schema
• Do NOT use "temporal" for month/year aggregations - use "ordinal"
• Ensure field names in Vega encoding exactly match SQL column aliases
`;
}

/**
 * Format database schema in a clear, readable way for AI consumption
 * 
 * @param {Object} schema - Database schema object
 * @returns {string} Formatted schema description
 */
function formatSchemaForAI(schema) {
  let formatted = `Database: ${schema.database} (${schema.dialect})\n`;
  formatted += `Total Tables: ${schema.tables.length}\n\n`;

  schema.tables.forEach(table => {
    formatted += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    formatted += `TABLE: ${table.name}\n`;
    formatted += `Description: ${table.description}\n`;
    formatted += `Columns:\n`;

    table.columns.forEach(col => {
      const nullable = col.nullable ? 'NULL' : 'NOT NULL';
      formatted += `  • ${col.name} (${col.type}, ${nullable})`;
      if (col.description) {
        formatted += ` - ${col.description}`;
      }
      formatted += '\n';
    });

    if (table.relationships && table.relationships.length > 0) {
      formatted += `Relationships:\n`;
      table.relationships.forEach(rel => {
        formatted += `  • ${rel.column} → ${rel.foreignTable}.${rel.foreignColumn}\n`;
      });
    }

    formatted += '\n';
  });

  return formatted;
}

/**
 * Validate the structure of AI response
 * Ensures all required fields are present
 * 
 * @param {Object} response - Parsed AI response object
 * @throws {Error} If response structure is invalid
 */
function validateAIResponse(response) {
  const requiredFields = {
    sqlQuery: 'SQL query',
    vegaSpec: 'Vega-Lite specification',
    analysis: 'Analysis metadata'
  };

  // Check for missing top-level fields
  for (const [field, description] of Object.entries(requiredFields)) {
    if (!response[field]) {
      throw new Error(`AI response missing required field: ${description} (${field})`);
    }
  }

  // Validate Vega-Lite spec structure
  if (!response.vegaSpec.encoding) {
    throw new Error('Vega-Lite specification missing encoding field');
  }

  if (!response.vegaSpec.$schema) {
    throw new Error('Vega-Lite specification missing $schema field');
  }
}

/**
 * Log token usage for cost monitoring and optimization
 * 
 * @param {Object} usage - Token usage object from OpenAI response
 * @param {number} usage.prompt_tokens - Input tokens used
 * @param {number} usage.completion_tokens - Output tokens generated
 * @param {number} usage.total_tokens - Total tokens consumed
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
 * Calculate estimated API cost based on token usage
 * Uses GPT-4o-mini pricing as of 2024
 * 
 * @param {number} totalTokens - Total number of tokens used
 * @returns {string} Estimated cost in USD formatted as currency
 */
function calculateCost(totalTokens) {
  // GPT-4o-mini pricing: $0.150 per 1M input tokens, $0.600 per 1M output tokens
  // Using average for simplicity
  const costPer1MTokens = 0.15; 
  const cost = (totalTokens / 1000000) * costPer1MTokens;
  return `$${cost.toFixed(6)}`;
}

/**
 * Test OpenAI API connection and authentication
 * 
 * @returns {Promise<Object>} Test result with connection status
 * @throws {Error} If connection test fails
 */
export async function testOpenAIConnection() {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: 'Respond with "OK" if you can read this message.' }
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
 * Get current AI model configuration information
 * 
 * @returns {Object} Model information including name, provider, and capabilities
 */
export function getModelInfo() {
  return {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    provider: 'OpenAI',
    features: [
      'Natural language to SQL translation',
      'Intelligent chart type selection',
      'Dynamic database schema understanding',
      'Multi-table JOIN operations',
      'Complex data aggregations',
      'Time-series analysis'
    ]
  };
}
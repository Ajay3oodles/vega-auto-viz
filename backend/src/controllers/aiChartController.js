// controllers/aiChartController.js
// AI-powered chart generation from natural language prompts

import { sequelize } from '../models/index.js';
import { QueryTypes } from 'sequelize';

/**
 * Generate chart from natural language prompt
 * @route POST /api/ai-chart
 * @body { prompt: string }
 */
export const generateChartFromPrompt = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    console.log('📝 User prompt:', prompt);

    // Step 1: Analyze prompt and determine intent
    const analysis = analyzePrompt(prompt);
    console.log('🔍 Analysis:', analysis);

    // Step 2: Generate SQL query based on analysis
    const sqlQuery = generateSQLQuery(analysis);
    console.log('💾 SQL Query:', sqlQuery);

    // Step 3: Execute query
    const data = await sequelize.query(sqlQuery, {
      type: QueryTypes.SELECT
    });
    console.log('📊 Data rows:', data.length);

    // Step 4: Generate Vega-Lite specification
    const vegaSpec = generateVegaLiteSpec(analysis, data);

    res.status(200).json({
      success: true,
      prompt,
      analysis,
      sql: sqlQuery,
      dataCount: data.length,
      data,
      vegaSpec
    });

  } catch (error) {
    console.error('❌ Error generating chart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate chart',
      error: error.message,
      hint: 'Try rephrasing your prompt. Examples: "Show sales by category", "Average age by country", "Top products by revenue"'
    });
  }
};

/**
 * Analyze natural language prompt to extract intent
 */
function analyzePrompt(prompt) {
  const lower = prompt.toLowerCase();
  
  // Determine table
  let table = 'sales';
  if (lower.includes('user') || lower.includes('customer')) {
    table = 'users';
  } else if (lower.includes('product') || lower.includes('inventory')) {
    table = 'products';
  }
  
  // Determine aggregation function
  let aggregation = 'sum';
  if (lower.includes('average') || lower.includes('avg') || lower.includes('mean')) {
    aggregation = 'avg';
  } else if (lower.includes('count') || lower.includes('number of') || lower.includes('how many')) {
    aggregation = 'count';
  } else if (lower.includes('max') || lower.includes('highest') || lower.includes('top')) {
    aggregation = 'max';
  } else if (lower.includes('min') || lower.includes('lowest') || lower.includes('bottom')) {
    aggregation = 'min';
  }
  
  // Determine grouping field (x-axis)
  let groupBy = null;
  let groupByField = null;
  
  if (table === 'sales') {
    if (lower.includes('category') || lower.includes('categories')) {
      groupBy = 'category';
      groupByField = 'category';
    } else if (lower.includes('region')) {
      groupBy = 'region';
      groupByField = 'region';
    } else if (lower.includes('product')) {
      groupBy = 'product_name';
      groupByField = 'product_name';
    } else if (lower.includes('month') || lower.includes('time') || lower.includes('date')) {
      groupBy = 'month';
      groupByField = "TO_CHAR(sale_date, 'YYYY-MM')";
    } else {
      groupBy = 'category';
      groupByField = 'category';
    }
  } else if (table === 'users') {
    if (lower.includes('country') || lower.includes('countries')) {
      groupBy = 'country';
      groupByField = 'country';
    } else if (lower.includes('city') || lower.includes('cities')) {
      groupBy = 'city';
      groupByField = 'city';
    } else if (lower.includes('tier') || lower.includes('subscription')) {
      groupBy = 'subscription_tier';
      groupByField = 'subscription_tier';
    } else {
      groupBy = 'country';
      groupByField = 'country';
    }
  } else if (table === 'products') {
    if (lower.includes('category') || lower.includes('categories')) {
      groupBy = 'category';
      groupByField = 'category';
    } else if (lower.includes('supplier')) {
      groupBy = 'supplier';
      groupByField = 'supplier';
    } else {
      groupBy = 'category';
      groupByField = 'category';
    }
  }
  
  // Determine value field (y-axis)
  let valueField = null;
  let valueColumn = null;
  
  if (table === 'sales') {
    if (lower.includes('revenue') || lower.includes('total') || lower.includes('sales') || lower.includes('amount')) {
      valueField = 'total_amount';
      valueColumn = 'amount * quantity';
    } else if (lower.includes('quantity') || lower.includes('units')) {
      valueField = 'quantity';
      valueColumn = 'quantity';
    } else {
      valueField = 'total_amount';
      valueColumn = 'amount * quantity';
    }
  } else if (table === 'users') {
    if (lower.includes('age')) {
      valueField = 'age';
      valueColumn = 'age';
    } else {
      valueField = 'user_count';
      valueColumn = 'id';
    }
  } else if (table === 'products') {
    if (lower.includes('price')) {
      valueField = 'price';
      valueColumn = 'price';
    } else if (lower.includes('stock') || lower.includes('inventory')) {
      valueField = 'stock_quantity';
      valueColumn = 'stock_quantity';
    } else {
      valueField = 'product_count';
      valueColumn = 'id';
    }
  }
  
  // Determine chart type
  let chartType = 'bar';
  if (lower.includes('line') || lower.includes('trend') || lower.includes('over time')) {
    chartType = 'line';
  } else if (lower.includes('pie')) {
    chartType = 'arc';
  } else if (lower.includes('scatter') || lower.includes('point')) {
    chartType = 'point';
  } else if (lower.includes('area')) {
    chartType = 'area';
  }
  
  // Determine limit
  let limit = null;
  const topMatch = lower.match(/top (\d+)/);
  if (topMatch) {
    limit = parseInt(topMatch[1]);
  }
  
  // Determine sort order
  let sortOrder = 'DESC';
  if (lower.includes('lowest') || lower.includes('bottom') || lower.includes('least')) {
    sortOrder = 'ASC';
  }
  
  return {
    table,
    groupBy,
    groupByField,
    valueField,
    valueColumn,
    aggregation,
    chartType,
    limit,
    sortOrder
  };
}

/**
 * Generate SQL query from analysis
 */
function generateSQLQuery(analysis) {
  const {
    table,
    groupBy,
    groupByField,
    valueField,
    valueColumn,
    aggregation,
    limit,
    sortOrder
  } = analysis;
  
  let aggFunc = aggregation.toUpperCase();
  let selectClause = '';
  
  if (aggregation === 'count') {
    selectClause = `${groupByField} as ${groupBy}, COUNT(*) as ${valueField}`;
  } else {
    selectClause = `${groupByField} as ${groupBy}, ${aggFunc}(${valueColumn}) as ${valueField}`;
  }
  
  let query = `
    SELECT ${selectClause}
    FROM ${table}
    WHERE ${groupBy} IS NOT NULL
    GROUP BY ${groupByField}
    ORDER BY ${valueField} ${sortOrder}
  `;
  
  if (limit) {
    query += `\n    LIMIT ${limit}`;
  }
  
  return query.trim();
}

/**
 * Generate Vega-Lite specification from analysis and data
 */
function generateVegaLiteSpec(analysis, data) {
  const { chartType, groupBy, valueField, aggregation } = analysis;
  
  // Determine field types
  const xType = groupBy === 'month' ? 'temporal' : 'nominal';
  const yType = 'quantitative';
  
  // Base specification
  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: 'Auto-generated chart from natural language',
    width: 700,
    height: 400,
    data: { values: data },
    mark: {
      type: chartType,
      tooltip: true
    }
  };
  
  // Configure encoding based on chart type
  if (chartType === 'arc') {
    // Pie chart
    spec.mark = { type: 'arc', tooltip: true };
    spec.encoding = {
      theta: {
        field: valueField,
        type: 'quantitative'
      },
      color: {
        field: groupBy,
        type: 'nominal',
        legend: { title: groupBy.replace('_', ' ').toUpperCase() }
      }
    };
  } else {
    // Bar, line, point, area charts
    spec.encoding = {
      x: {
        field: groupBy,
        type: xType,
        axis: {
          labelAngle: -45,
          title: groupBy.replace('_', ' ').toUpperCase()
        }
      },
      y: {
        field: valueField,
        type: yType,
        axis: {
          title: `${aggregation.toUpperCase()} of ${valueField.replace('_', ' ')}`
        }
      },
      color: {
        field: groupBy,
        type: 'nominal',
        legend: null
      }
    };
    
    // Add tooltip
    spec.encoding.tooltip = [
      { field: groupBy, type: xType },
      { field: valueField, type: yType, format: ',.2f' }
    ];
  }
  
  return spec;
}

/**
 * Get available prompt examples
 * @route GET /api/ai-chart/examples
 */
export const getPromptExamples = async (req, res) => {
  const examples = {
    sales: [
      "Show total sales by category",
      "What are the top 5 products by revenue?",
      "Average sales amount by region",
      "Show sales trend over time",
      "Count of sales by category"
    ],
    users: [
      "Show user distribution by country",
      "Average age by country",
      "How many users per subscription tier?",
      "Show users by city",
      "Count users by country"
    ],
    products: [
      "Show products by category",
      "Average price by category",
      "Total inventory by category",
      "Top 10 most expensive products",
      "Products by supplier"
    ],
    advanced: [
      "Show top 3 categories by total revenue",
      "Average product price by supplier",
      "User count by subscription tier",
      "Monthly sales trend",
      "Bottom 5 products by stock quantity"
    ]
  };
  
  res.status(200).json({
    success: true,
    examples,
    tips: [
      "Be specific about what you want to see",
      "Mention aggregation: sum, average, count, max, min",
      "Specify grouping: by category, by region, by country, etc.",
      "Use 'top N' or 'bottom N' for limits",
      "Mention chart type: bar, line, pie, scatter, area"
    ]
  });
};
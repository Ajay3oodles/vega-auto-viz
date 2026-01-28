// services/chartService.js
// Service layer for chart-related operations
// Handles Vega-Lite spec processing and validation

/**
 * Validate Vega-Lite specification
 * 
 * @param {Object} vegaSpec - Vega-Lite specification
 * @returns {Object} Validation result
 */
export function validateVegaSpec(vegaSpec) {
  const validation = {
    valid: true,
    errors: []
  };

  // Check required fields
  if (!vegaSpec.$schema) {
    validation.errors.push('Missing $schema field');
    validation.valid = false;
  }

  if (!vegaSpec.mark) {
    validation.errors.push('Missing mark field');
    validation.valid = false;
  }

  if (!vegaSpec.encoding) {
    validation.errors.push('Missing encoding field');
    validation.valid = false;
  }

  if (!vegaSpec.data) {
    validation.errors.push('Missing data field');
    validation.valid = false;
  }

  // Validate mark type
  const validMarks = ['bar', 'line', 'point', 'arc', 'area', 'rect', 'rule', 'text', 'tick'];
  const markType = typeof vegaSpec.mark === 'object' ? vegaSpec.mark.type : vegaSpec.mark;
  
  if (!validMarks.includes(markType)) {
    validation.errors.push(`Invalid mark type: ${markType}`);
    validation.valid = false;
  }

  return validation;
}

/**
 * Enhance Vega-Lite spec with data and default styling
 * 
 * @param {Object} vegaSpec - Base Vega-Lite spec
 * @param {Array} data - Data to inject
 * @param {Object} options - Enhancement options
 * @returns {Object} Enhanced Vega-Lite spec
 */
export function enhanceVegaSpec(vegaSpec, data, options = {}) {
  const {
    theme = 'default',
    responsive = false,
    tooltip = true
  } = options;

  // Clone spec to avoid mutation
  const enhanced = JSON.parse(JSON.stringify(vegaSpec));

  // Inject data
  enhanced.data = { values: data };

  // Add responsive sizing
if (responsive) {
  enhanced.width = 'container';
  enhanced.autosize = { type: 'fit', contains: 'padding' };
} else {
  enhanced.width = enhanced.width || 700;
}
enhanced.height = enhanced.height || 400;


  // Ensure tooltip is enabled
  if (tooltip && enhanced.mark) {
    if (typeof enhanced.mark === 'string') {
      enhanced.mark = { type: enhanced.mark, tooltip: true };
    } else {
      enhanced.mark.tooltip = true;
    }
  }

  // Apply theme
  if (theme !== 'default') {
    enhanced.config = getThemeConfig(theme);
  }

  return enhanced;
}

/**
 * Get theme configuration for Vega-Lite
 * 
 * @param {string} theme - Theme name
 * @returns {Object} Theme configuration
 */
function getThemeConfig(theme) {
  const themes = {
    dark: {
      background: '#1e1e1e',
      title: { color: '#ffffff' },
      axis: {
        labelColor: '#cccccc',
        titleColor: '#ffffff',
        gridColor: '#444444',
        domainColor: '#666666'
      },
      legend: {
        labelColor: '#cccccc',
        titleColor: '#ffffff'
      }
    },
    minimal: {
      axis: {
        grid: false,
        domain: false
      },
      view: {
        stroke: 'transparent'
      }
    },
    professional: {
      background: 'white',
      title: {
        fontSize: 16,
        fontWeight: 600,
        color: '#1f2937'
      },
      axis: {
        labelFontSize: 12,
        titleFontSize: 14,
        labelColor: '#6b7280',
        titleColor: '#374151',
        gridColor: '#e5e7eb'
      }
    }
  };

  return themes[theme] || {};
}

/**
 * Convert chart data to different formats
 * 
 * @param {Array} data - Chart data
 * @param {string} format - Target format (csv, json, excel)
 * @returns {string|Buffer} Converted data
 */
export function convertChartData(data, format = 'json') {
  switch (format.toLowerCase()) {
    case 'csv':
      return convertToCSV(data);
    
    case 'json':
      return JSON.stringify(data, null, 2);
    
    case 'tsv':
      return convertToTSV(data);
    
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Convert data array to CSV string
 * 
 * @param {Array} data - Data array
 * @returns {string} CSV string
 */
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Convert data array to TSV string
 * 
 * @param {Array} data - Data array
 * @returns {string} TSV string
 */
function convertToTSV(data) {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const tsvRows = [headers.join('\t')];

  data.forEach(row => {
    const values = headers.map(header => row[header]);
    tsvRows.push(values.join('\t'));
  });

  return tsvRows.join('\n');
}

/**
 * Generate chart summary statistics
 * 
 * @param {Array} data - Chart data
 * @param {Object} analysis - Chart analysis metadata
 * @returns {Object} Summary statistics
 */
export function generateChartSummary(data, analysis) {
  if (!data || data.length === 0) {
    return {
      totalRecords: 0,
      message: 'No data available'
    };
  }

  const summary = {
    totalRecords: data.length,
    chartType: analysis.chartType,
    aggregation: analysis.aggregation,
    groupBy: analysis.groupBy
  };

  // Calculate basic statistics if numeric data present
  const numericColumns = findNumericColumns(data);
  
  if (numericColumns.length > 0) {
    summary.statistics = {};
    
    numericColumns.forEach(col => {
      const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
      
      summary.statistics[col] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        sum: values.reduce((a, b) => a + b, 0),
        count: values.length
      };
    });
  }

  return summary;
}

/**
 * Find numeric columns in data
 * 
 * @param {Array} data - Data array
 * @returns {Array} Array of numeric column names
 */
function findNumericColumns(data) {
  if (!data || data.length === 0) return [];

  const firstRow = data[0];
  const numericCols = [];

  Object.keys(firstRow).forEach(key => {
    const value = firstRow[key];
    if (typeof value === 'number' || !isNaN(parseFloat(value))) {
      numericCols.push(key);
    }
  });

  return numericCols;
}

/**
 * Suggest alternative chart types based on data characteristics
 * 
 * @param {Array} data - Chart data
 * @param {Object} analysis - Current chart analysis
 * @returns {Array} Array of alternative chart suggestions
 */
export function suggestAlternativeCharts(data, analysis) {
  const suggestions = [];

  if (!data || data.length === 0) {
    return suggestions;
  }

  const numericCols = findNumericColumns(data);
  const hasTimeData = detectTimeColumn(data);
  const categoricalCols = Object.keys(data[0]).filter(k => !numericCols.includes(k));

  // Suggest line chart for time series
  if (hasTimeData && analysis.chartType !== 'line') {
    suggestions.push({
      type: 'line',
      reason: 'Time-series data detected - line chart shows trends better'
    });
  }

  // Suggest pie chart for part-to-whole
  if (data.length <= 8 && analysis.chartType !== 'arc') {
    suggestions.push({
      type: 'arc',
      reason: 'Small number of categories - pie chart shows proportions well'
    });
  }

  // Suggest scatter for correlation
  if (numericCols.length >= 2 && analysis.chartType !== 'point') {
    suggestions.push({
      type: 'point',
      reason: 'Multiple numeric columns - scatter plot can show correlation'
    });
  }

  return suggestions;
}

/**
 * Detect if data contains time-based columns
 * 
 * @param {Array} data - Data array
 * @returns {boolean} True if time column detected
 */
function detectTimeColumn(data) {
  if (!data || data.length === 0) return false;

  const firstRow = data[0];
  const timePatterns = [
    /date/i,
    /time/i,
    /year/i,
    /month/i,
    /day/i,
    /^\d{4}-\d{2}/,  // YYYY-MM format
    /^\d{4}$/         // Year
  ];

  return Object.keys(firstRow).some(key => {
    const value = firstRow[key];
    return timePatterns.some(pattern => {
      if (pattern.test(key)) return true;
      if (typeof value === 'string' && pattern.test(value)) return true;
      return false;
    });
  });
}

/**
 * Optimize Vega spec for large datasets
 * 
 * @param {Object} vegaSpec - Vega-Lite spec
 * @param {number} dataSize - Size of dataset
 * @returns {Object} Optimized spec
 */
export function optimizeVegaSpec(vegaSpec, dataSize) {
  const optimized = JSON.parse(JSON.stringify(vegaSpec));

  // For large datasets (>1000 points)
  if (dataSize > 1000) {
    // Disable hover tooltips for performance
    if (optimized.mark && typeof optimized.mark === 'object') {
      optimized.mark.tooltip = false;
    }

    // Add data sampling hint
    optimized.transform = optimized.transform || [];
    optimized.transform.push({
      sample: 1000
    });
  }

  return optimized;
}
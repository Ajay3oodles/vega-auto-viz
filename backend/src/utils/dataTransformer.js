// utils/dataTransformer.js
// Simple utility to transform data keys to UI-friendly format

import { snakeToTitle } from './labelFormatter.js';

/**
 * Transform data array keys from snake_case/SCREAMING_CASE to Title Case
 * 
 * @param {Array} data - Array of data objects with snake_case keys
 * @returns {Array} Transformed data array with Title Case keys
 * 
 * @example
 * Input:  [{ subscription_tier: "pro", average_order_value: 705.28 }]
 * Output: [{ "Subscription Tier": "pro", "Average Order Value": 705.28 }]
 */
export function transformDataKeys(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return data;
  }

  return data.map(row => {
    const transformedRow = {};

    Object.entries(row).forEach(([key, value]) => {
      // Convert to lowercase first (handles SCREAMING_CASE), then to Title Case
      const titleCaseKey = snakeToTitle(key.toLowerCase());
      transformedRow[titleCaseKey] = value;
    });

    return transformedRow;
  });
}
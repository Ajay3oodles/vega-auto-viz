// utils/helpers.js
// Helper utilities for common operations

/**
 * Format number with thousand separators
 * 
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined || isNaN(num)) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

/**
 * Format currency value
 * 
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Format date to readable string
 * 
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type (short, long, full)
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'short') {
  if (!date) return 'N/A';

  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  };

  return d.toLocaleDateString('en-US', options[format] || options.short);
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 * 
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return 'N/A';

  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
}

/**
 * Truncate text to specified length
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength, suffix = '...') {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Convert string to title case
 * 
 * @param {string} str - String to convert
 * @returns {string} Title cased string
 */
export function toTitleCase(str) {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert snake_case to Title Case
 * 
 * @param {string} str - Snake case string
 * @returns {string} Title case string
 */
export function snakeToTitle(str) {
  if (!str) return '';
  
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Deep clone an object
 * 
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 * 
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
export function isEmpty(obj) {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim() === '';
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

/**
 * Generate unique ID
 * 
 * @returns {string} Unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sleep for specified milliseconds
 * 
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async function with exponential backoff
 * 
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in milliseconds
 * @returns {Promise} Result of function
 */
export async function retry(fn, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await sleep(delay * Math.pow(2, i)); // Exponential backoff
      }
    }
  }

  throw lastError;
}

/**
 * Batch process array in chunks
 * 
 * @param {Array} array - Array to process
 * @param {number} chunkSize - Size of each chunk
 * @param {Function} processFn - Function to process each chunk
 * @returns {Promise<Array>} Results from all chunks
 */
export async function batchProcess(array, chunkSize, processFn) {
  const results = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    const chunkResults = await processFn(chunk);
    results.push(...chunkResults);
  }

  return results;
}

/**
 * Debounce function
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * 
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;

  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Calculate percentage
 * 
 * @param {number} value - Value
 * @param {number} total - Total
 * @param {number} decimals - Decimal places
 * @returns {number} Percentage
 */
export function calculatePercentage(value, total, decimals = 2) {
  if (total === 0) return 0;
  return Number(((value / total) * 100).toFixed(decimals));
}

/**
 * Calculate average of array
 * 
 * @param {Array<number>} numbers - Array of numbers
 * @returns {number} Average
 */
export function average(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return sum / numbers.length;
}

/**
 * Get unique values from array
 * 
 * @param {Array} array - Input array
 * @returns {Array} Array with unique values
 */
export function unique(array) {
  return [...new Set(array)];
}

/**
 * Group array by key
 * 
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}

/**
 * Sort array by key
 * 
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Parse JSON safely
 * 
 * @param {string} jsonString - JSON string to parse
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} Parsed object or default value
 */
export function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Get nested object property safely
 * 
 * @param {Object} obj - Object to traverse
 * @param {string} path - Dot-separated path (e.g., 'user.profile.name')
 * @param {any} defaultValue - Default value if path not found
 * @returns {any} Value at path or default value
 */
export function getNestedValue(obj, path, defaultValue = undefined) {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }

  return result !== undefined ? result : defaultValue;
}
// utils/validation.js
// Validation utilities for input validation and sanitization

/**
 * Validate user prompt
 * 
 * @param {string} prompt - User's natural language prompt
 * @returns {Object} Validation result
 */
export function validatePrompt(prompt) {
  const validation = {
    valid: true,
    errors: []
  };

  // Check if prompt exists
  if (!prompt || typeof prompt !== 'string') {
    validation.valid = false;
    validation.errors.push('Prompt is required and must be a string');
    return validation;
  }

  // Trim and check length
  const trimmed = prompt.trim();
  
  if (trimmed.length === 0) {
    validation.valid = false;
    validation.errors.push('Prompt cannot be empty');
    return validation;
  }

  if (trimmed.length < 3) {
    validation.valid = false;
    validation.errors.push('Prompt must be at least 3 characters long');
  }

  if (trimmed.length > 1000) {
    validation.valid = false;
    validation.errors.push('Prompt must be less than 1000 characters');
  }

  // Check for SQL injection patterns
  const dangerousPatterns = [
    /;.*DROP/i,
    /;.*DELETE/i,
    /;.*TRUNCATE/i,
    /;.*ALTER/i,
    /UNION.*SELECT/i
  ];

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(trimmed)) {
      validation.valid = false;
      validation.errors.push('Potentially dangerous SQL pattern detected');
    }
  });

  return validation;
}

/**
 * Validate table name
 * 
 * @param {string} tableName - Table name to validate
 * @returns {Object} Validation result
 */
export function validateTableName(tableName) {
  const validation = {
    valid: true,
    errors: []
  };

  if (!tableName || typeof tableName !== 'string') {
    validation.valid = false;
    validation.errors.push('Table name is required');
    return validation;
  }

  // Check for valid characters (alphanumeric and underscore only)
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    validation.valid = false;
    validation.errors.push('Table name contains invalid characters');
  }

  // Check length
  if (tableName.length > 64) {
    validation.valid = false;
    validation.errors.push('Table name is too long (max 64 characters)');
  }

  return validation;
}

/**
 * Validate column name
 * 
 * @param {string} columnName - Column name to validate
 * @returns {Object} Validation result
 */
export function validateColumnName(columnName) {
  return validateTableName(columnName); // Same rules apply
}

/**
 * Sanitize user input
 * 
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/['"]/g, '') // Remove quotes
    .slice(0, 1000); // Limit length
}

/**
 * Validate pagination parameters
 * 
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Validation result with sanitized values
 */
export function validatePagination(page, limit) {
  const validation = {
    valid: true,
    errors: [],
    sanitized: {
      page: 1,
      limit: 20
    }
  };

  // Validate page
  const pageNum = parseInt(page);
  if (isNaN(pageNum) || pageNum < 1) {
    validation.sanitized.page = 1;
  } else if (pageNum > 10000) {
    validation.sanitized.page = 10000;
    validation.errors.push('Page number too large, limiting to 10000');
  } else {
    validation.sanitized.page = pageNum;
  }

  // Validate limit
  const limitNum = parseInt(limit);
  if (isNaN(limitNum) || limitNum < 1) {
    validation.sanitized.limit = 20;
  } else if (limitNum > 1000) {
    validation.sanitized.limit = 1000;
    validation.errors.push('Limit too large, limiting to 1000');
  } else {
    validation.sanitized.limit = limitNum;
  }

  return validation;
}

/**
 * Validate email address
 * 
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
export function validateEmail(email) {
  const validation = {
    valid: true,
    errors: []
  };

  if (!email || typeof email !== 'string') {
    validation.valid = false;
    validation.errors.push('Email is required');
    return validation;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    validation.valid = false;
    validation.errors.push('Invalid email format');
  }

  return validation;
}

/**
 * Validate API key format
 * 
 * @param {string} apiKey - API key to validate
 * @returns {Object} Validation result
 */
export function validateApiKey(apiKey) {
  const validation = {
    valid: true,
    errors: []
  };

  if (!apiKey || typeof apiKey !== 'string') {
    validation.valid = false;
    validation.errors.push('API key is required');
    return validation;
  }

  if (apiKey.length < 20) {
    validation.valid = false;
    validation.errors.push('API key is too short');
  }

  return validation;
}

/**
 * Validate date string
 * 
 * @param {string} dateString - Date string to validate
 * @returns {Object} Validation result
 */
export function validateDate(dateString) {
  const validation = {
    valid: true,
    errors: [],
    parsed: null
  };

  if (!dateString) {
    validation.valid = false;
    validation.errors.push('Date is required');
    return validation;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    validation.valid = false;
    validation.errors.push('Invalid date format');
  } else {
    validation.parsed = date;
  }

  return validation;
}

/**
 * Validate numeric value
 * 
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function validateNumber(value, options = {}) {
  const {
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    integer = false
  } = options;

  const validation = {
    valid: true,
    errors: [],
    parsed: null
  };

  const num = Number(value);
  
  if (isNaN(num)) {
    validation.valid = false;
    validation.errors.push('Value is not a number');
    return validation;
  }

  if (integer && !Number.isInteger(num)) {
    validation.valid = false;
    validation.errors.push('Value must be an integer');
  }

  if (num < min) {
    validation.valid = false;
    validation.errors.push(`Value must be at least ${min}`);
  }

  if (num > max) {
    validation.valid = false;
    validation.errors.push(`Value must be at most ${max}`);
  }

  validation.parsed = num;
  return validation;
}
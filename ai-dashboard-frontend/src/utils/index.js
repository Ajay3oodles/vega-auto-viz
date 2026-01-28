/**
 * Utility Functions
 * 
 * This file contains reusable utility functions used throughout the application.
 * These are pure functions that perform specific tasks and can be easily tested.
 */

import { STORAGE_KEYS, MAX_RECENT_PROMPTS } from '../constants';

/**
 * Format a number with thousand separators
 * 
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number
 * 
 * Example: formatNumber(1234567.89, 2) => "1,234,567.89"
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Format a date to readable string
 * 
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'time'
 * @returns {string} Formatted date
 * 
 * Example: formatDate(new Date(), 'long') => "January 28, 2025"
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
  };
  
  return d.toLocaleDateString('en-US', options[format] || options.short);
};

/**
 * Truncate text to specified length
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text with ellipsis
 * 
 * Example: truncateText("Hello World", 8) => "Hello..."
 */
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Debounce function to limit how often a function can fire
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 * 
 * Example: const debouncedSearch = debounce(searchFunction, 300);
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep clone an object (simple version)
 * 
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * 
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Generate a random ID
 * 
 * @returns {string} Random ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Save recent prompts to local storage
 * 
 * @param {string} prompt - Prompt to save
 */
export const saveRecentPrompt = (prompt) => {
  try {
    const recent = getRecentPrompts();
    
    // Remove duplicate if exists
    const filtered = recent.filter(p => p !== prompt);
    
    // Add new prompt at beginning
    const updated = [prompt, ...filtered].slice(0, MAX_RECENT_PROMPTS);
    
    localStorage.setItem(STORAGE_KEYS.RECENT_PROMPTS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent prompt:', error);
  }
};

/**
 * Get recent prompts from local storage
 * 
 * @returns {string[]} Array of recent prompts
 */
export const getRecentPrompts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT_PROMPTS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting recent prompts:', error);
    return [];
  }
};

/**
 * Clear all recent prompts from local storage
 */
export const clearRecentPrompts = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.RECENT_PROMPTS);
  } catch (error) {
    console.error('Error clearing recent prompts:', error);
  }
};

/**
 * Copy text to clipboard
 * 
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

/**
 * Download data as JSON file
 * 
 * @param {Object} data - Data to download
 * @param {string} filename - Name of the file
 */
export const downloadJSON = (data, filename = 'chart-data.json') => {
  try {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading JSON:', error);
  }
};

/**
 * Get error message from error object
 * 
 * @param {Error|Object} error - Error object
 * @returns {string} Error message
 */
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

/**
 * Validate prompt length and content
 * 
 * @param {string} prompt - Prompt to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validatePrompt = (prompt) => {
  if (!prompt || prompt.trim() === '') {
    return { valid: false, error: 'Prompt cannot be empty' };
  }
  
  if (prompt.length < 3) {
    return { valid: false, error: 'Prompt is too short (minimum 3 characters)' };
  }
  
  if (prompt.length > 500) {
    return { valid: false, error: 'Prompt is too long (maximum 500 characters)' };
  }
  
  return { valid: true, error: null };
};

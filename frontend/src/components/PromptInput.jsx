/**
 * PromptInput Component
 * 
 * Input field where users can type their natural language queries.
 * Includes validation, character counter, and submit button.
 */

import React, { useState } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { validatePrompt } from '../utils';
import { UI_CONFIG } from '../constants';

const PromptInput = ({ onSubmit, isLoading }) => {
  // State to store the user's input
  const [prompt, setPrompt] = useState('');
  
  // State to store validation errors
  const [error, setError] = useState('');

  /**
   * Handle input change
   * Updates the prompt state and clears any existing errors
   */
  const handleChange = (e) => {
    const value = e.target.value;
    setPrompt(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  /**
   * Handle form submission
   * Validates the prompt and calls the onSubmit callback if valid
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    
    // Validate the prompt
    const validation = validatePrompt(prompt);
    
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    
    // Clear error and call parent's submit handler
    setError('');
    onSubmit(prompt.trim());
  };

  /**
   * Handle Enter key press
   * Submit on Enter, but allow Shift+Enter for new lines
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Calculate character count
  const charCount = prompt.length;
  const maxChars = UI_CONFIG.MAX_PROMPT_LENGTH;
  const isNearLimit = charCount > maxChars * 0.8;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Input Container with gradient border effect */}
        <div className="relative">
          {/* Gradient border effect (visible on focus) */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300"></div>
          
          {/* Actual input container */}
          <div className="relative bg-white rounded-lg shadow-md group">
            {/* Textarea for prompt input */}
            <textarea
              value={prompt}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything... e.g., 'Show total sales by category' or 'Top 10 products by revenue'"
              disabled={isLoading}
              rows={3}
              maxLength={maxChars}
              className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-gray-200 
                       focus:border-primary-500 focus:outline-none 
                       disabled:bg-gray-100 disabled:cursor-not-allowed
                       resize-none transition-colors duration-200"
            />
            
            {/* Sparkles icon decoration */}
            <div className="absolute top-3 right-3 text-gray-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Footer: Character counter and Submit button */}
        <div className="flex items-center justify-between">
          {/* Character counter */}
          <div className={`text-sm ${isNearLimit ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
            {charCount} / {maxChars}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="btn-primary flex items-center gap-2 min-w-[140px] justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Generate Chart</span>
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <div className="text-red-600 text-sm flex-1">
              {error}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default PromptInput;

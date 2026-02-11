import React, { useState } from 'react';
import { Send, Loader2, Sparkles, Zap } from 'lucide-react';
import { validatePrompt } from '../utils';
import { UI_CONFIG } from '../constants';

const PromptInput = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setPrompt(value);
    
    if (error) {
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validatePrompt(prompt);
    
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    
    setError('');
    onSubmit(prompt.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const charCount = prompt.length;
  const maxChars = UI_CONFIG.MAX_PROMPT_LENGTH;
  const isNearLimit = charCount > maxChars * 0.8;
  const percentage = (charCount / maxChars) * 100;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Container */}
        <div className="relative group">
          {/* Animated gradient border effect */}
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-lg transition-all duration-300 ${
            isFocused ? 'opacity-70' : 'opacity-0'
          }`}></div>
          
          {/* Input wrapper */}
          <div className="relative">
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 transition-all duration-300 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 shadow-sm hover:shadow-md">
              {/* Sparkles decoration */}
              <div className="absolute top-4 right-4 z-10">
                <div className="relative">
                  <Sparkles className={`w-5 h-5 transition-all duration-300 ${
                    isFocused 
                      ? 'text-indigo-600 dark:text-indigo-400 scale-110' 
                      : 'text-gray-400 dark:text-gray-600'
                  }`} strokeWidth={2} />
                  {isFocused && (
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-50 animate-pulse"></div>
                  )}
                </div>
              </div>
              
              {/* Textarea */}
              <textarea
                value={prompt}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Describe the chart you want to create... (e.g., 'Show total sales by category as a bar chart')"
                disabled={isLoading}
                rows={4}
                maxLength={maxChars}
                className="w-full px-6 py-4 pr-14 bg-transparent rounded-2xl 
                         text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
                         focus:outline-none resize-none
                         disabled:opacity-50 disabled:cursor-not-allowed"
              />
              
              {/* Character count progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800 rounded-b-2xl overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    isNearLimit 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Stats and Actions */}
        <div className="flex items-center justify-between gap-4">
          {/* Character counter */}
          <div className="flex items-center gap-3">
            <div className={`text-sm font-medium transition-colors ${
              isNearLimit 
                ? 'text-orange-600 dark:text-orange-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {charCount} / {maxChars}
            </div>
            
            {/* AI indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-full">
              <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">AI-Powered</span>
            </div>
          </div>

<button
  type="submit"
  disabled={isLoading || !prompt.trim()}
  className="
    relative inline-flex items-center gap-2
    rounded-xl px-6 py-3
    text-sm font-semibold
    bg-gradient-to-r from-violet-600 to-indigo-600
    text-white
    shadow-lg shadow-violet-600/25
    transition-all duration-200
    hover:shadow-xl hover:shadow-violet-600/40
    hover:brightness-110
    active:scale-[0.98]
    disabled:cursor-not-allowed
    disabled:opacity-50
    disabled:shadow-none
    group
  "
>
  {/* Subtle shimmer */}
  {!isLoading && (
    <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
      <span className="absolute inset-y-0 -left-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
    </span>
  )}

  {isLoading ? (
    <>
      <Loader2
        className="h-4 w-4 animate-spin"
        strokeWidth={2.5}
      />
      <span>Generating…</span>
    </>
  ) : (
    <>
      <Send
        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
        strokeWidth={2.5}
      />
      <span>Generate Chart</span>
    </>
  )}
</button>

        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mt-0.5">
                <span className="text-red-600 dark:text-red-400 text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-400 flex-1">
                {error}
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default PromptInput;
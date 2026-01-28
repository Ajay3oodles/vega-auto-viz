/**
 * ExamplePrompts Component
 * 
 * Displays categorized example prompts that users can click to quickly generate charts.
 * Helps users understand what kind of queries they can make.
 */

import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { QUICK_PROMPTS } from '../constants';

const ExamplePrompts = ({ onSelectPrompt, isLoading }) => {
  // State to track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState({
    SALES: true,    // Sales category expanded by default
    USERS: false,
    PRODUCTS: false,
  });

  /**
   * Toggle category expansion
   */
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  /**
   * Handle prompt click
   */
  const handlePromptClick = (prompt) => {
    if (!isLoading) {
      onSelectPrompt(prompt);
    }
  };

  // Category configuration with icons and colors
  const categories = [
    {
      key: 'SALES',
      title: 'Sales Analytics',
      icon: '💰',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      key: 'USERS',
      title: 'User Analytics',
      icon: '👥',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      key: 'PRODUCTS',
      title: 'Product Analytics',
      icon: '📦',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Example Queries
          </h3>
          <p className="text-sm text-gray-600">
            Click any example to generate a chart instantly
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {categories.map((category) => {
          const isExpanded = expandedCategories[category.key];
          const prompts = QUICK_PROMPTS[category.key] || [];

          return (
            <div
              key={category.key}
              className={`border-2 rounded-lg overflow-hidden transition-all duration-200 ${category.borderColor}`}
            >
              {/* Category Header (Clickable) */}
              <button
                onClick={() => toggleCategory(category.key)}
                className={`w-full px-4 py-3 flex items-center justify-between ${category.bgColor} hover:opacity-80 transition-opacity duration-200`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <span className={`font-semibold ${category.color}`}>
                    {category.title}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({prompts.length} examples)
                  </span>
                </div>
                
                {/* Expand/Collapse icon */}
                {isExpanded ? (
                  <ChevronUp className={`w-5 h-5 ${category.color}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${category.color}`} />
                )}
              </button>

              {/* Category Content (Collapsible) */}
              {isExpanded && (
                <div className="p-4 bg-white space-y-2">
                  {prompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptClick(prompt)}
                      disabled={isLoading}
                      className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 hover:border-gray-300"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-gray-400">→</span>
                        {prompt}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          💡 Tips for better results:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• Be specific about what you want to see</li>
          <li>• Mention aggregations: sum, average, count, max, min</li>
          <li>• Specify grouping: by category, by region, by country</li>
          <li>• Use "top N" or "bottom N" for limits</li>
          <li>• Mention chart type if you have a preference</li>
        </ul>
      </div>
    </div>
  );
};

export default ExamplePrompts;

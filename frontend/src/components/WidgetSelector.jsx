/**
 * WidgetSelector Component (Edit Mode) - UPDATED
 * 
 * Dropdown to select a widget to edit - NOW ALWAYS VISIBLE below search bar
 * When a widget is selected, isNew will be false for updates
 */

import React, { useState } from 'react';
import { ChevronDown, Edit, X, Search } from 'lucide-react';

const WidgetSelector = ({ 
  widgets, 
  selectedWidgetId, 
  onSelectWidget,
  onClearSelection,
  isLoading 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Handle widget selection
   */
  const handleSelectWidget = (widgetId) => {
    onSelectWidget(widgetId);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  /**
   * Handle clear selection
   */
  const handleClear = () => {
    onClearSelection();
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  /**
   * Get selected widget
   */
  const selectedWidget = widgets.find(w => w.id === selectedWidgetId);

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  /**
   * Filter widgets based on search term
   */
  const filteredWidgets = widgets.filter(widget => 
    widget.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    widget.id?.toString().includes(searchTerm) ||
    widget.prompt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If no widget is selected, show selection prompt
  if (!selectedWidgetId) {
    return (
      <div className="card border-2 border-blue-300 bg-blue-50">
        <div className="flex items-center justify-between gap-4">
          {/* Info Section */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Edit className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                Update Existing Widget
              </p>
              <p className="text-sm text-blue-700">
                Select a widget to update it
              </p>
            </div>
          </div>

          {/* Widget Dropdown Selector */}
          <div className="flex-1 max-w-md relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isLoading || widgets.length === 0}
              className="w-full px-4 py-2 bg-white border-2 border-blue-300 rounded-lg 
                       hover:border-blue-500 focus:border-blue-500 focus:outline-none
                       disabled:bg-gray-100 disabled:cursor-not-allowed
                       flex items-center justify-between gap-2 transition-colors duration-200"
            >
              <div className="flex-1 text-left">
                <span className="text-gray-500 text-sm">
                  {widgets.length === 0 
                    ? 'No widgets available' 
                    : 'Select widget to edit...'}
                </span>
              </div>
              
              <ChevronDown 
                className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                {/* Search Box */}
                {widgets.length > 5 && (
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search widgets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Widget List */}
                <div className="max-h-80 overflow-y-auto">
                  {filteredWidgets.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <p className="text-sm">
                        {searchTerm ? 'No widgets match your search' : 'No widgets available'}
                      </p>
                    </div>
                  ) : (
                    filteredWidgets.map((widget) => (
                      <button
                        key={widget.id}
                        onClick={() => handleSelectWidget(widget.id)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 
                                  flex items-start gap-3 border-b border-gray-100 last:border-b-0
                                  transition-colors duration-200"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-gray-900">
                            {widget.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 truncate">
                            {widget.prompt}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            ID: {widget.id} • Created: {formatDate(widget.createdAt)}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Text */}
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Select a widget from the dropdown above, then submit a new prompt to update it. Or leave unselected to create a new widget.
          </p>
        </div>
      </div>
    );
  }

  // Widget is selected - show editor mode
  return (
    <div className="card border-2 border-primary-300 bg-primary-50">
      <div className="flex items-center justify-between gap-4">
        {/* Edit Mode Label */}
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 p-2 rounded-lg">
            <Edit className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary-900 uppercase tracking-wide">
              Edit Mode
            </p>
            <p className="text-sm text-primary-700">
              Editing existing widget
            </p>
          </div>
        </div>

        {/* Selected Widget Dropdown */}
        <div className="flex-1 max-w-md relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-white border-2 border-primary-300 rounded-lg 
                     hover:border-primary-500 focus:border-primary-500 focus:outline-none
                     disabled:bg-gray-100 disabled:cursor-not-allowed
                     flex items-center justify-between gap-2 transition-colors duration-200"
          >
            <div className="flex-1 text-left min-w-0">
              {selectedWidget ? (
                <>
                  <div className="font-medium text-gray-900 truncate">
                    {selectedWidget.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {selectedWidget.id}
                  </div>
                </>
              ) : (
                <span className="text-gray-500">Select widget...</span>
              )}
            </div>
            
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
              {/* Search Box */}
              {widgets.length > 5 && (
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search widgets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              )}

              {/* Widget List */}
              <div className="max-h-80 overflow-y-auto">
                {filteredWidgets.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <p className="text-sm">
                      {searchTerm ? 'No widgets match your search' : 'No widgets available'}
                    </p>
                  </div>
                ) : (
                  filteredWidgets.map((widget) => (
                    <button
                      key={widget.id}
                      onClick={() => handleSelectWidget(widget.id)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 
                                flex items-start gap-3 border-b border-gray-100 last:border-b-0
                                transition-colors duration-200
                                ${selectedWidgetId === widget.id ? 'bg-primary-50' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${
                          selectedWidgetId === widget.id 
                            ? 'text-primary-600' 
                            : 'text-gray-900'
                        }`}>
                          {widget.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">
                          {widget.prompt}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          ID: {widget.id} • Created: {formatDate(widget.createdAt)}
                        </div>
                      </div>
                      
                      {selectedWidgetId === widget.id && (
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clear Button */}
        <button
          onClick={handleClear}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 
                   rounded-lg transition-colors duration-200"
          title="Cancel editing"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Info Text */}
      <div className="mt-3 pt-3 border-t border-primary-200">
        <p className="text-sm text-primary-700">
          ✏️ Submit a new prompt below to update <strong>{selectedWidget?.name}</strong>. Your changes will be saved to the existing widget.
        </p>
      </div>
    </div>
  );
};

export default WidgetSelector;
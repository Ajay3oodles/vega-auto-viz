/**
 * Sidebar Component
 * 
 * Displays list of all saved widgets in a left panel
 * Users can select widgets to view their charts
 */

import React from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';

const Sidebar = ({ widgets, activeWidgetId, onSelectWidget, onNewWidget, onDeleteWidget }) => {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Widgets</h2>
        
        {/* New Widget Button */}
        <button
          onClick={onNewWidget}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Widget
        </button>
      </div>

      {/* Widget List */}
      <div className="flex-1 overflow-y-auto">
        {widgets.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No widgets yet</p>
            <p className="text-xs mt-1">Create your first widget!</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  activeWidgetId === widget.id
                    ? 'bg-primary-50 border-2 border-primary-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
                onClick={() => onSelectWidget(widget.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate text-sm">
                      {widget.name || 'Untitled Widget'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(widget.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteWidget(widget.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-opacity duration-200"
                    title="Delete widget"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Active Indicator */}
                {activeWidgetId === widget.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-l-lg" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600 text-center">
          {widgets.length} {widgets.length === 1 ? 'widget' : 'widgets'} total
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
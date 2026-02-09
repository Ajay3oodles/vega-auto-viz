import React from 'react';
import { LayoutGrid, Plus, Loader2, Inbox } from 'lucide-react';
import WidgetCard from './WidgetCard';

const WidgetDashboard = ({ widgets, isLoading, onEditWidget, onDeleteWidget, onCreateNew }) => {
  if (isLoading) {
    return (
      <div className="card max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading your widgets...</p>
        </div>
      </div>
    );
  }

  if (!widgets || widgets.length === 0) {
    return (
      <div className="card max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <Inbox className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Widgets Yet</h3>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            Get started by creating your first widget.
          </p>
          <button onClick={onCreateNew} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Your First Widget
          </button>
        </div>
      </div>
    );
  }

  // Categorize widgets by chart type
  const categorizeWidget = (widget) => {
    const chartType = widget.analysis?.chartType?.toLowerCase() || '';
    
    // Arc/Pie charts
    if (chartType === 'arc' || chartType.includes('pie') || chartType.includes('donut')) {
      return 'arc';
    }
    // Bar and other wide charts
    if (chartType === 'bar' || chartType.includes('line') || 
        chartType.includes('area') || chartType.includes('scatter')) {
      return 'wide';
    }
    return 'compact';
  };

  // Group widgets by type
  const wideWidgets = widgets.filter(w => categorizeWidget(w) === 'wide');
  const arcWidgets = widgets.filter(w => categorizeWidget(w) === 'arc');
  const compactWidgets = widgets.filter(w => categorizeWidget(w) === 'compact');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
            <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Widgets Dashboard</h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {widgets.length} {widgets.length === 1 ? 'widget' : 'widgets'} created
            </p>
          </div>
        </div>

        <button onClick={onCreateNew} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto flex-shrink-0">
          <Plus className="w-5 h-5" />
          <span>Create New Widget</span>
        </button>
      </div>

      {/* Wide Charts Section (Bar, Line, etc.) */}
      {wideWidgets.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px bg-gray-200 flex-1"></div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider px-2 sm:px-3">
              Charts
            </h3>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>
          
          {/* Responsive grid: 1 col mobile, 2 cols tablet+ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {wideWidgets.map((widget) => (
              <WidgetCard
                key={widget.id}
                widget={widget}
                onEdit={onEditWidget}
                onDelete={onDeleteWidget}
                layoutType="wide"
              />
            ))}
          </div>
        </div>
      )}

      {/* Arc/Pie Charts Section */}
      {arcWidgets.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px bg-gray-200 flex-1"></div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider px-2 sm:px-3">
              Distributions
            </h3>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>
          
          {/* Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {arcWidgets.map((widget) => (
              <WidgetCard
                key={widget.id}
                widget={widget}
                onEdit={onEditWidget}
                onDelete={onDeleteWidget}
                layoutType="compact"
              />
            ))}
          </div>
        </div>
      )}

      {/* Compact Widgets Section */}
      {compactWidgets.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px bg-gray-200 flex-1"></div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider px-2 sm:px-3">
              Metrics
            </h3>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>
          
          {/* Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {compactWidgets.map((widget) => (
              <WidgetCard
                key={widget.id}
                widget={widget}
                onEdit={onEditWidget}
                onDelete={onDeleteWidget}
                layoutType="compact"
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer Hint */}
      <div className="text-center text-xs sm:text-sm text-gray-400 pt-4 sm:pt-6 border-t border-gray-200">
        💡 Hover over any widget to edit or delete it
      </div>
    </div>
  );
};

export default WidgetDashboard;
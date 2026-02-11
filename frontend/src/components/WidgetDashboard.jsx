import React from 'react';
import { LayoutGrid, Plus, Loader2, Inbox, TrendingUp } from 'lucide-react';
import WidgetCard from './WidgetCard';

const WidgetDashboard = ({ widgets, isLoading, onEditWidget, onDeleteWidget, onCreateNew }) => {
  if (isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <Loader2 className="relative w-16 h-16 text-indigo-600 animate-spin" strokeWidth={2} />
          </div>
          <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!widgets || widgets.length === 0) {
    return (
      <div className="max-w-[1600px] mx-auto">
        <div className="card card-elevated">
          <div className="flex flex-col items-center justify-center py-20">
            {/* Empty state illustration */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl">
                <Inbox className="w-20 h-20 text-gray-400 dark:text-gray-600" strokeWidth={1.5} />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No Widgets Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
              Start visualizing your data by creating your first analytics widget
            </p>
            
            <button 
              onClick={onCreateNew} 
              className="btn-primary btn-lg group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Create Your First Widget
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Categorize widgets by chart type
  const categorizeWidget = (widget) => {
    const chartType = widget.analysis?.chartType?.toLowerCase() || '';
    
    if (chartType === 'arc' || chartType.includes('pie') || chartType.includes('donut')) {
      return 'arc';
    }
    if (chartType === 'bar' || chartType.includes('line') || 
        chartType.includes('area') || chartType.includes('scatter')) {
      return 'wide';
    }
    return 'compact';
  };

  const wideWidgets = widgets.filter(w => categorizeWidget(w) === 'wide');
  const arcWidgets = widgets.filter(w => categorizeWidget(w) === 'arc');
  const compactWidgets = widgets.filter(w => categorizeWidget(w) === 'compact');

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-2xl">
              <LayoutGrid className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Dashboard
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-4 h-4" />
              <span>
                {widgets.length} {widgets.length === 1 ? 'widget' : 'widgets'}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">Last updated today</span>
            </div>
          </div>
        </div>

        {/* <button 
          onClick={onCreateNew} 
          className="btn-primary btn-lg group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>New Widget</span>
        </button> */}
      </div>

      {/* Wide Charts Section */}
      {wideWidgets.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent flex-1"></div>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4">
              Charts & Trends
            </h3>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent flex-1"></div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
        </section>
      )}

      {/* Arc/Pie Charts Section */}
      {arcWidgets.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent flex-1"></div>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4">
              Distributions
            </h3>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent flex-1"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
        </section>
      )}

      {/* Compact Widgets Section */}
      {compactWidgets.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent flex-1"></div>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4">
              Key Metrics
            </h3>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent flex-1"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
        </section>
      )}

      {/* Dashboard Footer */}
      <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          💡 Hover over any widget to edit or delete
        </p>
      </div>
    </div>
  );
};

export default WidgetDashboard;
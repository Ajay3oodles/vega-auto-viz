import React from 'react';
import { LayoutGrid, Plus, Loader2, Inbox } from 'lucide-react';
import WidgetCard from './WidgetCard';

const WidgetDashboard = ({ widgets, isLoading, onEditWidget, onDeleteWidget, onCreateNew }) => {
  if (isLoading) {
    return (
      <div className="card">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading your widgets...</p>
        </div>
      </div>
    );
  }

  if (!widgets || widgets.length === 0) {
    return (
      <div className="card">
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

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary-100 p-2 rounded-lg">
            <LayoutGrid className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Widgets Dashboard</h2>
            <p className="text-sm text-gray-600">
              {widgets.length} {widgets.length === 1 ? 'widget' : 'widgets'} created
            </p>
          </div>
        </div>

        <button onClick={onCreateNew} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Create New Widget</span>
        </button>
      </div>

      {/* Widgets Grid - Auto-adjusting based on chart type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {widgets.map((widget) => (
          <WidgetCard
            key={widget.id}
            widget={widget}
            onEdit={onEditWidget}
            onDelete={onDeleteWidget}
          />
        ))}
      </div>

      <div className="text-center text-sm text-gray-500 pt-4">
        Hover over any widget to edit or delete it
      </div>
    </div>
  );
};

export default WidgetDashboard;
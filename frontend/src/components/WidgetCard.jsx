import React from 'react';
import { Vega } from 'react-vega';
import { Edit, Trash2, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { formatNumber, formatDate } from '../utils';

const WidgetCard = ({ widget, onEdit, onDelete }) => {
  const getCardSpan = () => {
    const chartType = widget.analysis?.chartType?.toLowerCase() || '';
    if (chartType === 'bar' || chartType.includes('line') || chartType.includes('area') || chartType.includes('scatter')) {
      return 'md:col-span-2';
    }
    return 'md:col-span-1';
  };

  const getChartDimensions = () => {
    const chartType = widget.analysis?.chartType?.toLowerCase() || '';
    if (chartType === 'bar' || chartType.includes('line')) {
      return { width: 600, height: 300 };
    }
    return { width: 300, height: 300 };
  };

  const getDataCount = () => {
    try {
      return widget.vegaSpec?.data?.values?.length || 0;
    } catch (error) {
      return 0;
    }
  };

// Locate getCardSpec and update the return object:
  const getCardSpec = () => {
    if (!widget.vegaSpec) return null;
    try {
      const { width, height } = getChartDimensions();
      const chartType = widget.analysis?.chartType?.toLowerCase() || '';
      
      return {
        ...widget.vegaSpec,
        width,
        height,
        // Safely apply tooltip to mark if it exists
        ...(widget.vegaSpec.mark ? {
          mark: typeof widget.vegaSpec.mark === 'object' 
            ? { ...widget.vegaSpec.mark, tooltip: true } 
            : { type: widget.vegaSpec.mark, tooltip: true }
        } : {}),
        config: {
          ...widget.vegaSpec.config,
          view: { stroke: null },
          // Force tooltips globally for all chart types (fixes Pie/arc)
          mark: { ...widget.vegaSpec.config?.mark, tooltip: true },
          arc: { ...widget.vegaSpec.config?.arc, tooltip: true },
          bar: { ...widget.vegaSpec.config?.bar, tooltip: true },
          line: { ...widget.vegaSpec.config?.line, tooltip: true },
          point: { ...widget.vegaSpec.config?.point, tooltip: true },
          axis: { 
            labelFontSize: 11, 
            titleFontSize: 12, 
            labelLimit: 100,
            labelAngle: chartType === 'bar' ? -45 : 0,
          },
          legend: { 
            labelFontSize: 11, 
            titleFontSize: 12,
            orient: 'right',
          },
        },
      };
    } catch (error) {
      return null;
    }
  };

  const cardSpec = getCardSpec();
  const dataCount = getDataCount();
  const cardSpan = getCardSpan();
  const chartType = widget.analysis?.chartType?.toLowerCase() || '';

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group relative overflow-hidden ${cardSpan}`}>
      {/* Card Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-2">
              {widget.name || 'Untitled Chart'}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-1" title={widget.prompt}>
              {widget.prompt || 'No prompt available'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(widget); }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit widget"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(widget.id); }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete widget"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-6 bg-gray-50 flex items-center justify-center">
        {cardSpec ? (
          <div className="w-full flex justify-center">
            <Vega spec={cardSpec} actions={false} renderer="canvas" />
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <div className="text-gray-400 text-sm">No chart data</div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-600">
              <TrendingUp className="w-3.5 h-3.5 text-primary-600" />
              <span className="font-medium">{chartType}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <span className="font-semibold text-primary-600">{formatNumber(dataCount)}</span>
              <span>rows</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(widget.createdAt, 'short')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetCard;
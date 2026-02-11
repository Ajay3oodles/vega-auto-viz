import React from 'react';
import { Vega } from 'react-vega';
import { Edit, Trash2, TrendingUp, Calendar, AlertCircle, BarChart2 } from 'lucide-react';
import { formatNumber, formatDate } from '../utils';

const WidgetCard = ({ widget, onEdit, onDelete, layoutType = 'compact' }) => {
  const chartType = widget.analysis?.chartType?.toLowerCase() || '';

  const getDataCount = () => {
    try {
      return widget.vegaSpec?.data?.values?.length || 0;
    } catch (error) {
      return 0;
    }
  };

  const getCardSpec = () => {
    if (!widget.vegaSpec) {
      console.warn('No vegaSpec for widget:', widget.id);
      return null;
    }
    
    try {
      const spec = JSON.parse(JSON.stringify(widget.vegaSpec));
      const isArcChart = spec.mark === 'arc' || spec.mark?.type === 'arc';
      
      // Responsive dimensions
      if (layoutType === 'wide') {
        spec.width = 420;
        spec.height = 280;
      } else if (isArcChart) {
        spec.width = 300;
        spec.height = 300;
      } else {
        spec.width = 320;
        spec.height = 260;
      }
      
      spec.autosize = {
        type: 'fit',
        contains: 'padding',
        resize: true
      };
      
      // Fix tooltips for arc charts
      if (isArcChart) {
        if (!spec.encoding.tooltip || spec.encoding.tooltip.length === 0) {
          const tooltipFields = [];
          if (spec.encoding.color && spec.encoding.color.field) {
            tooltipFields.push({
              field: spec.encoding.color.field,
              type: spec.encoding.color.type || 'nominal',
              title: spec.encoding.color.field
            });
          }
          if (spec.encoding.theta && spec.encoding.theta.field) {
            tooltipFields.push({
              field: spec.encoding.theta.field,
              type: spec.encoding.theta.type || 'quantitative',
              title: spec.encoding.theta.field
            });
          }
          spec.encoding.tooltip = tooltipFields;
        }
      }
      
      if (typeof spec.mark === 'string') {
        spec.mark = { type: spec.mark, tooltip: true };
      } else if (spec.mark && typeof spec.mark === 'object') {
        spec.mark.tooltip = true;
      }
      
      // Modern config with better styling
      spec.config = {
        ...spec.config,
        view: { stroke: null },
        background: 'transparent',
        padding: { top: 10, bottom: 10, left: 10, right: 10 },
        axis: {
          ...spec.config?.axis,
          labelFontSize: 11,
          titleFontSize: 12,
          labelLimit: 100,
          grid: true,
          gridOpacity: 0.1,
          gridColor: '#e5e5e5',
          domain: false,
          tickSize: 0,
          labelPadding: 8,
          titlePadding: 12,
          labelFont: 'Inter, sans-serif',
          titleFont: 'Inter, sans-serif',
          labelColor: '#737373',
          titleColor: '#404040',
          titleFontWeight: 600
        },
        legend: {
          ...spec.config?.legend,
          labelFontSize: 11,
          titleFontSize: 12,
          labelLimit: 120,
          orient: 'bottom',
          offset: 10,
          padding: 8,
          columns: isArcChart ? 2 : 3,
          labelFont: 'Inter, sans-serif',
          titleFont: 'Inter, sans-serif',
          labelColor: '#737373',
          titleColor: '#404040',
          symbolSize: 100,
          symbolStrokeWidth: 0
        }
      };
      
      if (spec.mark?.type === 'bar' || spec.mark === 'bar') {
        if (spec.encoding?.x) {
          spec.encoding.x.axis = {
            ...spec.encoding.x.axis,
            labelAngle: -35,
            labelAlign: 'right',
            labelLimit: 80
          };
        }
      }
      
      return spec;
      
    } catch (error) {
      console.error('Error processing spec for widget', widget.id, ':', error);
      return null;
    }
  };

  const cardSpec = getCardSpec();
  const dataCount = getDataCount();

  // Get chart type badge color
  const getChartTypeColor = () => {
    const type = chartType.toLowerCase();
    if (type.includes('bar')) return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400';
    if (type.includes('line')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (type.includes('pie') || type.includes('arc')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    if (type.includes('scatter')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  return (
    <div className="group relative">
      {/* Card with glass-morphism effect */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-700 flex flex-col h-full">
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
        
        {/* Card Header */}
        <div className="relative p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-br from-gray-50/50 to-transparent dark:from-gray-800/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" strokeWidth={2.5} />
                <h3 className="font-semibold text-gray-900 dark:text-white text-base line-clamp-1">
                  {widget.name || 'Untitled Chart'}
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2" title={widget.prompt}>
                {widget.prompt || 'No description available'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(widget); }}
                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                title="Edit widget"
              >
                <Edit className="w-4 h-4" strokeWidth={2} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(widget.id); }}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                title="Delete widget"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="relative p-5 flex items-center justify-center flex-grow min-h-[280px] bg-gradient-to-br from-gray-50/30 to-transparent dark:from-transparent">
          {cardSpec ? (
            <div className="w-full h-full max-w-full flex items-center justify-center">
              <Vega 
                spec={cardSpec} 
                actions={false} 
                renderer="canvas"
                onError={(error) => {
                  console.error('Vega rendering error for widget', widget.id, ':', error);
                }}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" strokeWidth={1.5} />
              <div className="text-gray-400 dark:text-gray-600 text-sm">No chart data available</div>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="relative px-5 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Chart Type Badge */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getChartTypeColor()}`}>
                <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
                {chartType}
              </span>
              
              {/* Data Count */}
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{formatNumber(dataCount)}</span>
                <span className="hidden sm:inline">rows</span>
              </div>
            </div>
            
            {/* Created Date */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
              <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="hidden lg:inline">{formatDate(widget.createdAt, 'short')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetCard;
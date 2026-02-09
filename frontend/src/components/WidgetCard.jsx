import React from 'react';
import { Vega } from 'react-vega';
import { Edit, Trash2, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
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
      // Clone the spec
      const spec = JSON.parse(JSON.stringify(widget.vegaSpec));
      
      // Determine if this is an arc/pie chart
      const isArcChart = spec.mark === 'arc' || spec.mark?.type === 'arc';
      
      // Set responsive dimensions - MUCH smaller to fit containers
      if (layoutType === 'wide') {
        // Bar/line charts - wider but not too wide
        spec.width = 400;
        spec.height = 250;
      } else if (isArcChart) {
        // Pie charts - moderate size
        spec.width = 280;
        spec.height = 280;
      } else {
        // Other compact charts
        spec.width = 300;
        spec.height = 250;
      }
      
      // Add container-based autosize
      spec.autosize = {
        type: 'fit',
        contains: 'padding',
        resize: true
      };
      
      // Fix tooltip for arc/pie charts
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
      
      // Ensure mark has tooltip enabled
      if (typeof spec.mark === 'string') {
        spec.mark = { type: spec.mark, tooltip: true };
      } else if (spec.mark && typeof spec.mark === 'object') {
        spec.mark.tooltip = true;
      }
      
      // Responsive config
      spec.config = {
        ...spec.config,
        view: { 
          stroke: null
        },
        background: 'transparent',
        padding: 5,
        axis: {
          ...spec.config?.axis,
          labelFontSize: 10,
          titleFontSize: 11,
          labelLimit: 80,
          grid: true,
          gridOpacity: 0.2
        },
        legend: {
          ...spec.config?.legend,
          labelFontSize: 10,
          titleFontSize: 11,
          labelLimit: 100,
          // Always put legend at bottom for responsive design
          orient: 'bottom',
          offset: 5,
          padding: 5,
          columns: isArcChart ? 2 : 3
        }
      };
      
      // For bar charts, configure axis labels
      if (spec.mark?.type === 'bar' || spec.mark === 'bar') {
        if (spec.encoding?.x) {
          spec.encoding.x.axis = {
            ...spec.encoding.x.axis,
            labelAngle: -45,
            labelAlign: 'right',
            labelLimit: 60
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

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group relative overflow-hidden flex flex-col h-full">
      {/* Card Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2">
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
              className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit widget"
            >
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(widget.id); }}
              className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete widget"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Area - Responsive with max-width to prevent overflow */}
      <div className="p-3 sm:p-4 bg-gray-50 flex items-center justify-center flex-grow overflow-hidden">
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
          <div className="text-center py-8 sm:py-12">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
            <div className="text-gray-400 text-xs sm:text-sm">No chart data available</div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 text-gray-600">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-600" />
              <span className="font-medium truncate">{chartType}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <span className="font-semibold text-primary-600">{formatNumber(dataCount)}</span>
              <span className="hidden sm:inline">rows</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">{formatDate(widget.createdAt, 'short')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetCard;
/**
 * ChartDisplay Component
 * 
 * Renders the Vega-Lite chart using react-vega library.
 * Displays chart with metadata and export options.
 */

import React from 'react';
import { Vega } from 'react-vega';
import { Download, Copy, TrendingUp, Database, Code } from 'lucide-react';
import { copyToClipboard, downloadJSON, formatNumber } from '../utils';
import { VEGA_THEME } from '../constants';

const ChartDisplay = ({ chartData, onCopy, onDownload }) => {
  // If no chart data is provided, don't render anything
  if (!chartData) return null;

  const { vegaSpec, data, analysis, prompt, dataCount, sql } = chartData;

  /**
   * Handle copy chart spec to clipboard
   */
  const handleCopySpec = async () => {
    const success = await copyToClipboard(JSON.stringify(vegaSpec, null, 2));
    if (success && onCopy) {
      onCopy('Chart specification copied to clipboard!');
    }
  };

  /**
   * Handle download data as JSON
   */
  const handleDownloadData = () => {
    downloadJSON(data, `chart-data-${Date.now()}.json`);
    if (onDownload) {
      onDownload('Data downloaded successfully!');
    }
  };

  /**
   * Handle download SQL query
   */
  const handleDownloadSQL = () => {
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `query-${Date.now()}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Apply custom theme to Vega spec
  const themedSpec = {
    ...vegaSpec,
    config: {
      ...vegaSpec.config,
      ...VEGA_THEME,
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Chart Metadata Card */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          {/* Prompt display */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              Generated Chart
            </h3>
            <p className="text-sm text-gray-600 truncate">
              Query: <span className="font-medium">{prompt}</span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Copy spec button */}
            <button
              onClick={handleCopySpec}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
              title="Copy Vega-Lite specification"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Copy Spec</span>
            </button>

            {/* Download data button */}
            <button
              onClick={handleDownloadData}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center gap-2"
              title="Download chart data"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download Data</span>
            </button>
          </div>
        </div>

        {/* Chart Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {formatNumber(dataCount)}
            </div>
            <div className="text-xs text-gray-600 mt-1">Data Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analysis.chartType}
            </div>
            <div className="text-xs text-gray-600 mt-1">Chart Type</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 truncate">
              {analysis.groupBy || 'N/A'}
            </div>
            <div className="text-xs text-gray-600 mt-1">Grouped By</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 uppercase">
              {analysis.aggregation}
            </div>
            <div className="text-xs text-gray-600 mt-1">Aggregation</div>
          </div>
        </div>
      </div>

      {/* Chart Visualization Card */}
      <div className="card">
        <div className="bg-gray-50 rounded-lg p-6 min-h-[500px] flex items-center justify-center">
          {/* Vega chart component */}
          <Vega
            spec={themedSpec}
            actions={{
              export: true,    // Enable export to PNG/SVG
              source: false,   // Hide view source button
              compiled: false, // Hide view compiled Vega button
              editor: false,   // Hide open in Vega editor button
            }}
          />
        </div>
      </div>

      {/* SQL Query Display (Collapsible) */}
      <details className="card cursor-pointer group">
        <summary className="font-semibold text-gray-900 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary-600" />
            Generated SQL Query
          </span>
          <Code className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform duration-200" />
        </summary>
        
        <div className="mt-4 space-y-3">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{sql}</code>
          </pre>
          
          <button
            onClick={handleDownloadSQL}
            className="btn-secondary text-sm"
          >
            <Download className="w-4 h-4 inline mr-2" />
            Download SQL
          </button>
        </div>
      </details>

      {/* Data Preview (Collapsible) */}
      <details className="card cursor-pointer group">
        <summary className="font-semibold text-gray-900 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary-600" />
            Data Preview ({dataCount} rows)
          </span>
          <Code className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform duration-200" />
        </summary>
        
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {data.length > 0 && Object.keys(data[0]).map((key) => (
                  <th
                    key={key}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.slice(0, 10).map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {typeof value === 'number' ? formatNumber(value, 2) : String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {data.length > 10 && (
            <div className="text-center py-3 text-sm text-gray-500 bg-gray-50">
              Showing 10 of {dataCount} rows
            </div>
          )}
        </div>
      </details>
    </div>
  );
};

export default ChartDisplay;

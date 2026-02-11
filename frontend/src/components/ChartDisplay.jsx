import React, { useState } from 'react';
import { Vega } from 'react-vega';
import { Download, Copy, TrendingUp, Database, Code, Check, ChevronDown } from 'lucide-react';
import { copyToClipboard, downloadJSON, formatNumber } from '../utils';
import { VEGA_THEME } from '../constants';

const ChartDisplay = ({ chartData, onCopy, onDownload }) => {
  const [copied, setCopied] = useState(false);
  const [isDataExpanded, setIsDataExpanded] = useState(false);

  if (!chartData) return null;

  const { vegaSpec, data, analysis, prompt, dataCount, sql } = chartData;

  const handleCopySpec = async () => {
    const success = await copyToClipboard(JSON.stringify(vegaSpec, null, 2));
    if (success && onCopy) {
      setCopied(true);
      onCopy('Chart specification copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadData = () => {
    downloadJSON(data, `chart-data-${Date.now()}.json`);
    if (onDownload) {
      onDownload('Data downloaded successfully!');
    }
  };

  const themedSpec = (() => {
    if (!vegaSpec) return null;
    
    const spec = JSON.parse(JSON.stringify(vegaSpec));
    
    if (spec.mark) {
      spec.mark = typeof spec.mark === 'object' 
        ? { ...spec.mark, tooltip: true } 
        : { type: spec.mark, tooltip: true };
    }

    if (spec.encoding && !spec.encoding.tooltip) {
      const tooltipFields = [];
      Object.keys(spec.encoding).forEach(channel => {
        const def = spec.encoding[channel];
        if (def && def.field) {
          tooltipFields.push({
            field: def.field,
            type: def.type,
            title: def.title || def.field
          });
        }
      });
      
      if (tooltipFields.length > 0) {
        spec.encoding.tooltip = tooltipFields;
      }
    }

    spec.config = {
      ...spec.config,
      ...VEGA_THEME,
      background: 'transparent'
    };

    return spec;
  })();

  // Get metric color based on type
  const getMetricColor = (type) => {
    if (type.toLowerCase().includes('bar')) return 'from-cyan-500 to-blue-500';
    if (type.toLowerCase().includes('line')) return 'from-emerald-500 to-teal-500';
    if (type.toLowerCase().includes('pie') || type.toLowerCase().includes('arc')) return 'from-purple-500 to-pink-500';
    return 'from-indigo-500 to-purple-500';
  };

  return (
    <div className="space-y-6">
      {/* Chart Header Card */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Title Section */}
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Generated Visualization
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Query:</span> {prompt}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySpec}
              className="btn-secondary group relative overflow-hidden"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" strokeWidth={2} />
                  <span className="hidden sm:inline">Copy Spec</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadData}
              className="btn-primary group"
            >
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" strokeWidth={2.5} />
              <span className="hidden sm:inline font-medium">Download</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          {/* Data Points */}
          <div className="group">
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-[3rem]"></div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Data Points</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {formatNumber(dataCount)}
              </p>
            </div>
          </div>

          {/* Chart Type */}
          <div className="group">
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-bl-[3rem]"></div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Chart Type</p>
              <p className={`text-2xl font-bold bg-gradient-to-r ${getMetricColor(analysis.chartType)} bg-clip-text text-transparent capitalize`}>
                {analysis.chartType}
              </p>
            </div>
          </div>

          {/* Aggregation */}
          <div className="group col-span-2 lg:col-span-1">
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-[3rem]"></div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Aggregation</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent uppercase">
                {analysis.aggregation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Visualization Card */}
      <div className="card card-elevated">
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-xl p-8 min-h-[500px] flex items-center justify-center border border-gray-200 dark:border-gray-800">
          <Vega
            spec={themedSpec}
            actions={{
              export: true,
              source: false,
              compiled: false,
              editor: false,
            }}
          />
        </div>
      </div>

      {/* Data Preview (Collapsible) */}
{/* Data Preview (Collapsible) */}
<div className="card">
  <button
    onClick={() => setIsDataExpanded(!isDataExpanded)}
    className="w-full flex items-center justify-between group"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl">
        <Database
          className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
          strokeWidth={2.5}
        />
      </div>
      <div className="text-left">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          Data Preview
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {dataCount} rows
        </p>
      </div>
    </div>

    <ChevronDown
      className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
        isDataExpanded ? "rotate-180" : ""
      }`}
    />
  </button>

  {isDataExpanded && data?.length > 0 && (
    <div className="mt-6 animate-fade-in">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden md:block max-h-[360px] overflow-auto">
          <table className="w-full text-sm table-auto">
            <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
              <tr>
                {Object.keys(data[0]).map((key, index, arr) => (
                  <th
                    key={key}
                    className={`
                      px-6 py-3 font-semibold uppercase tracking-wide
                      text-gray-700 dark:text-gray-300
                      ${index === 0 ? "text-left" : ""}
                      ${index === arr.length - 1 ? "text-right" : ""}
                      ${
                        index !== 0 && index !== arr.length - 1
                          ? "text-center"
                          : ""
                      }
                    `}
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.slice(0, 10).map((row, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition"
                >
                  {Object.entries(row).map(
                    ([key, value], index, arr) => (
                      <td
                        key={key}
                        className={`
                          px-6 py-3 tabular-nums
                          ${index === 0 ? "text-left" : ""}
                          ${
                            index === arr.length - 1
                              ? "text-right font-semibold text-indigo-600 dark:text-indigo-400"
                              : ""
                          }
                          ${
                            index !== 0 && index !== arr.length - 1
                              ? "text-center text-gray-800 dark:text-gray-200"
                              : ""
                          }
                        `}
                      >
                        {typeof value === "number"
                          ? Number.isInteger(value)
                            ? value
                            : formatNumber(value, 2)
                          : String(value)}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE VIEW ================= */}
        <div className="md:hidden max-h-[360px] overflow-auto space-y-3 p-3">
          {data.slice(0, 10).map((row, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 p-4"
            >
              {Object.entries(row).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {key}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                    {typeof value === "number"
                      ? Number.isInteger(value)
                        ? value
                        : formatNumber(value, 2)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {data.length > 10 && (
        <div className="mt-4 text-center py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold">10</span> of{" "}
            <span className="font-semibold">{dataCount}</span> rows
          </p>
        </div>
      )}
    </div>
  )}
</div>

    </div>
  );
};

export default ChartDisplay;
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import ChartDisplay from './components/ChartDisplay';
import ExamplePrompts from './components/ExamplePrompts';
import LoadingState from './components/LoadingState';
import ErrorDisplay from './components/ErrorDisplay';
import Toast from './components/Toast';
import WidgetDashboard from './components/WidgetDashboard';
import WidgetSelector from './components/WidgetSelector';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(true);
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);
  const [isLoadingWidget, setIsLoadingWidget] = useState(false);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      loadAllWidgets();

      // 1. INITIAL LOAD: Check if URL already has a widgetId (e.g., user refreshed the page)
      const params = new URLSearchParams(window.location.search);
      const urlWidgetId = params.get('widgetId');
      if (urlWidgetId) {
        // IDs might be numbers or strings from DB, safe cast
        const parsedId = isNaN(Number(urlWidgetId)) ? urlWidgetId : Number(urlWidgetId);
        setSelectedWidgetId(parsedId);
        loadWidgetById(parsedId);
      }
    }

    // 2. BACK BUTTON SUPPORT: Listen for browser back/forward clicks
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlWidgetId = params.get('widgetId');
      
      if (urlWidgetId) {
        const parsedId = isNaN(Number(urlWidgetId)) ? urlWidgetId : Number(urlWidgetId);
        setSelectedWidgetId(parsedId);
        loadWidgetById(parsedId);
      } else {
        // If we went back to the dashboard (no widgetId in URL)
        setSelectedWidgetId(null);
        setChartData(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const loadAllWidgets = async () => {
    try {
      setIsLoadingWidgets(true);
      const response = await axios.get('/api/ai-chart/widgets/full');
      if (response.data.success) {
        setWidgets(response.data.widgets || []);
      }
    } catch (err) {
      showToast('Failed to load widgets', 'error');
    } finally {
      setIsLoadingWidgets(false);
    }
  };

  const loadWidgetById = async (widgetId) => {
    if (!widgetId) {
      setChartData(null);
      return;
    }
    try {
      setIsLoadingWidget(true);
      setError(null);
      const response = await axios.get(`/api/ai-chart/widgets/${widgetId}`);
      if (response.data.success && response.data.widget) {
        const widget = response.data.widget;
        setChartData({
          widgetId: widget.id,
          widgetName: widget.name,
          prompt: widget.prompt,
          vegaSpec: widget.vegaSpec,
          data: widget.vegaSpec.data.values,
          analysis: widget.analysis,
          dataCount: widget.vegaSpec.data.values.length,
          sql: widget.sqlQuery || ''
        });
      }
    } catch (err) {
      setError('Failed to load widget');
    } finally {
      setIsLoadingWidget(false);
    }
  };

  const updateUrl = (widgetId) => {
    // Helper to change URL without reloading the page
    const newUrl = widgetId 
      ? `${window.location.pathname}?widgetId=${widgetId}`
      : window.location.pathname;
    window.history.pushState({ widgetId }, '', newUrl);
  };

  const handleEditWidget = (widget) => {
    setSelectedWidgetId(widget.id);
    loadWidgetById(widget.id);
    updateUrl(widget.id); // Update URL to ?widgetId=...
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteWidget = async (widgetId) => {
    if (!confirm('Are you sure you want to delete this widget?')) return;
    try {
      const response = await axios.delete(`/api/ai-chart/widgets/${widgetId}`);
      if (response.data.success) {
        setWidgets(widgets.filter(w => w.id !== widgetId));
        if (selectedWidgetId === widgetId) {
          setSelectedWidgetId(null);
          setChartData(null);
          updateUrl(null); // Clear URL if deleted
        }
        showToast('Widget deleted successfully', 'success');
      }
    } catch (err) {
      showToast('Failed to delete widget', 'error');
    }
  };

  const handleCreateNew = () => {
    setSelectedWidgetId(null);
    setChartData(null);
    setError(null);
    updateUrl(null); // Clear URL back to normal
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearSelection = () => {
    setSelectedWidgetId(null);
    setChartData(null);
    updateUrl(null); // Clear URL back to normal
  };

  const handleSubmit = async (prompt) => {
    setIsLoading(true);
    setError(null);
    try {
      const isNew = selectedWidgetId === null;
      const payload = { prompt, isNew, ...(isNew ? {} : { widgetId: selectedWidgetId }) };
      const response = await axios.post('/api/ai-chart', payload);

      if (response.data.success) {
        await loadAllWidgets();
        if (isNew) {
          setSelectedWidgetId(null);
          setChartData(null);
          // Don't scroll to bottom, keep user at top to see the success toast and dashboard
        } else {
          loadWidgetById(selectedWidgetId);
        }
        showToast(isNew ? 'Widget created!' : 'Widget updated!', 'success');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (prompt) => handleSubmit(prompt);
  const showToast = (message, type = 'success') => setToast({ message, type });
  const closeToast = () => setToast(null);
  const handleRetry = () => setError(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          <section>
            <WidgetSelector
              widgets={widgets}
              selectedWidgetId={selectedWidgetId}
              onSelectWidget={(id) => { 
                setSelectedWidgetId(id); 
                loadWidgetById(id);
                updateUrl(id); // Update URL when dropdown is used
              }}
              onClearSelection={handleClearSelection}
              isLoading={isLoading}
            />
          </section>

          <section>
            <PromptInput onSubmit={handleSubmit} isLoading={isLoading} />
          </section>

          {selectedWidgetId ? (
            <section>
              {isLoadingWidget ? (
                <div className="card py-12 text-center">Loading widget...</div>
              ) : isLoading ? (
                <LoadingState />
              ) : error ? (
                <ErrorDisplay error={error} onRetry={handleRetry} />
              ) : chartData ? (
                <ChartDisplay
                  chartData={chartData}
                  onCopy={(msg) => showToast(msg, 'success')}
                  onDownload={(msg) => showToast(msg, 'success')}
                />
              ) : null}
            </section>
          ) : (
            <section>
              <WidgetDashboard
                widgets={widgets}
                isLoading={isLoadingWidgets}
                onEditWidget={handleEditWidget}
                onDeleteWidget={handleDeleteWidget}
                onCreateNew={handleCreateNew}
              />
            </section>
          )}

          <section>
            <ExamplePrompts onSelectPrompt={handleExampleClick} isLoading={isLoading} />
          </section>
        </div>
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
}

export default App;
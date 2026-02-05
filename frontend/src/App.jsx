import React, { useState, useEffect, useRef } from 'react';
import { generateChart, getAllWidgets, getWidgetById, deleteWidget } from './services/api';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PromptInput from './components/PromptInput';
import ChartDisplay from './components/ChartDisplay';
import ExamplePrompts from './components/ExamplePrompts';
import LoadingState from './components/LoadingState';
import ErrorDisplay from './components/ErrorDisplay';
import EmptyState from './components/EmptyState';
import ConfirmationModal from './components/ConfirmationModal';
import Toast from './components/Toast';

function App() {
  const [widgets, setWidgets] = useState([]);
  const [activeWidgetId, setActiveWidgetId] = useState(null);
  const [activeWidgetData, setActiveWidgetData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState(null);
  
  const hasLoadedWidgets = useRef(false);
  const isLoadingWidgets = useRef(false);

  useEffect(() => {
    if (!hasLoadedWidgets.current) {
      hasLoadedWidgets.current = true;
      loadWidgetsList();
    }
  }, []);

  const loadWidgetsList = async () => {
    if (isLoadingWidgets.current) {
      console.log('⏸️ Already loading widgets, skip');
      return;
    }

    try {
      isLoadingWidgets.current = true;
      console.log('📋 Loading widgets...');
      const response = await getAllWidgets();
      if (response.success) {
        console.log('✅ Loaded', response.widgets.length, 'widgets');
        setWidgets(response.widgets);
      }
    } catch (err) {
      console.error('❌ Failed to load widgets:', err);
    } finally {
      isLoadingWidgets.current = false;
    }
  };

  const handleSelectWidget = async (widgetId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📂 Loading widget:', widgetId);
      const response = await getWidgetById(widgetId);
      
      if (response.success) {
        const widget = response.widget;
        setActiveWidgetId(widgetId);
        
        // Format data to match ChartDisplay expectations
        setActiveWidgetData({
          prompt: widget.prompt,
          vegaSpec: widget.vegaSpec,
          data: widget.vegaSpec.data.values || [],
          analysis: widget.analysis,
          dataCount: (widget.vegaSpec.data.values || []).length,
          sql: widget.sqlQuery || ''
        });
        console.log('✅ Widget loaded');
      }
    } catch (err) {
      console.error('❌ Failed to load widget:', err);
      setError('Failed to load widget');
      showToast('Failed to load widget', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewWidget = () => {
    setActiveWidgetId(null);
    setActiveWidgetData(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePromptSubmit = (prompt) => {
    setPendingPrompt(prompt);
    if (activeWidgetId) {
      setShowConfirmModal(true);
    } else {
      submitPrompt(prompt, true);
    }
  };

  const submitPrompt = async (prompt, isNew) => {
    setIsLoading(true);
    setError(null);
    setShowConfirmModal(false);

    try {
      console.log(`📝 Submitting: isNew=${isNew}, widgetId=${activeWidgetId}`);
      
      // Call API with isNew and widgetId
      const response = await generateChart(
        prompt,
        isNew,
        isNew ? null : activeWidgetId
      );
      
      if (response.success) {
        console.log('✅ Chart generated, data count:', response.dataCount);
        
        // CRITICAL: Set chart data IMMEDIATELY
        const chartData = {
          prompt: response.prompt,
          vegaSpec: response.vegaSpec,
          data: response.data || [],
          analysis: response.analysis,
          dataCount: response.dataCount,
          sql: response.sql || ''
        };
        
        setActiveWidgetData(chartData);
        console.log('✅ Chart data set in state');
        
        // Reload widgets list in background
        if (isNew) {
          // For new widgets, wait a bit then reload and find new widget
          setTimeout(async () => {
            console.log('🔄 Reloading widgets after creation...');
            const widgetsResponse = await getAllWidgets();
            if (widgetsResponse.success && widgetsResponse.widgets.length > 0) {
              setWidgets(widgetsResponse.widgets);
              
              // Set the newest widget as active
              const newestWidget = widgetsResponse.widgets[0];
              console.log('🆕 New widget ID:', newestWidget.id);
              setActiveWidgetId(newestWidget.id);
            }
          }, 300);
        } else {
          // For updates, just reload the list
          loadWidgetsList();
        }
        
        showToast('Chart generated successfully!', 'success');
      }
    } catch (err) {
      console.error('❌ Chart generation failed:', err);
      setError(err.message || 'An error occurred');
      showToast('Failed to generate chart', 'error');
    } finally {
      setIsLoading(false);
      setPendingPrompt(null);
    }
  };

  const handleDeleteWidget = async (widgetId) => {
    if (!confirm('Delete this widget?')) return;
    
    try {
      await deleteWidget(widgetId);
      await loadWidgetsList();
      
      if (activeWidgetId === widgetId) {
        setActiveWidgetId(null);
        setActiveWidgetData(null);
      }
      
      showToast('Widget deleted', 'success');
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const showToast = (message, type = 'success') => setToast({ message, type });
  const closeToast = () => setToast(null);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        widgets={widgets}
        activeWidgetId={activeWidgetId}
        onSelectWidget={handleSelectWidget}
        onNewWidget={handleNewWidget}
        onDeleteWidget={handleDeleteWidget}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
              <section>
                <PromptInput onSubmit={handlePromptSubmit} isLoading={isLoading} />
              </section>
              <section>
                {isLoading && <LoadingState />}
                {!isLoading && error && (
                  <ErrorDisplay 
                    error={error} 
                    onRetry={() => setError(null)} 
                    suggestions={['Try rephrasing', 'Check table names', 'Use simpler queries']} 
                  />
                )}
                {!isLoading && !error && activeWidgetData && (
                  <ChartDisplay 
                    chartData={activeWidgetData} 
                    onCopy={(m) => showToast(m, 'success')} 
                    onDownload={(m) => showToast(m, 'success')} 
                  />
                )}
                {!isLoading && !error && !activeWidgetData && (
                  <EmptyState hasWidgets={widgets.length > 0} />
                )}
              </section>
              <section>
                <ExamplePrompts onSelectPrompt={handlePromptSubmit} isLoading={isLoading} />
              </section>
            </div>
          </div>
        </main>
      </div>
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => { setShowConfirmModal(false); setPendingPrompt(null); }}
        onCreateNew={() => pendingPrompt && submitPrompt(pendingPrompt, true)}
        onUpdateExisting={() => pendingPrompt && submitPrompt(pendingPrompt, false)}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
}

export default App;
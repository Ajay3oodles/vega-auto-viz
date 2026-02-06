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
  
  // Dashboard state
  const [widgets, setWidgets] = useState([]);
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(true);
  
  // Edit mode state
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);
  const [isLoadingWidget, setIsLoadingWidget] = useState(false);

  // Prevent double API calls on mount
  const hasMounted = useRef(false);

  /**
   * Load all widgets with FULL DATA on mount
   */
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      loadAllWidgets();
    }
  }, []);

  /**
   * Fetch all widgets with FULL DATA from API
   */
  const loadAllWidgets = async () => {
    try {
      setIsLoadingWidgets(true);
      
      console.log('📡 Fetching widgets from /api/ai-chart/widgets/full...');
      const response = await axios.get('/api/ai-chart/widgets/full');

      console.log('📦 Raw response:', response.data);

      if (response.data.success) {
        const loadedWidgets = response.data.widgets || [];
        console.log('✅ Loaded widgets count:', loadedWidgets.length);
        
        // Debug each widget
        loadedWidgets.forEach((widget, index) => {
          console.log(`Widget ${index + 1}:`, {
            id: widget.id,
            name: widget.name,
            hasVegaSpec: !!widget.vegaSpec,
            hasAnalysis: !!widget.analysis,
            vegaSpecKeys: widget.vegaSpec ? Object.keys(widget.vegaSpec) : [],
            dataCount: widget.vegaSpec?.data?.values?.length || 0
          });
        });
        
        setWidgets(loadedWidgets);
      } else {
        console.error('❌ API returned success: false');
        showToast('Failed to load widgets', 'error');
      }
    } catch (err) {
      console.error('❌ Error loading widgets:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      showToast('Failed to load widgets: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setIsLoadingWidgets(false);
    }
  };

  /**
   * Load widget by ID for editing
   */
  const loadWidgetById = async (widgetId) => {
    if (!widgetId) {
      setChartData(null);
      return;
    }

    try {
      setIsLoadingWidget(true);
      setError(null);
      
      console.log('📡 Loading widget by ID:', widgetId);
      const response = await axios.get(`/api/ai-chart/widgets/${widgetId}`);
      
      if (response.data.success && response.data.widget) {
        const widget = response.data.widget;
        
        console.log('✅ Widget loaded:', {
          id: widget.id,
          name: widget.name,
          hasVegaSpec: !!widget.vegaSpec,
          dataCount: widget.vegaSpec?.data?.values?.length
        });
        
        // Format widget data to match chartData structure
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
      console.error('❌ Error loading widget:', err);
      setError('Failed to load widget');
      showToast('Failed to load widget', 'error');
    } finally {
      setIsLoadingWidget(false);
    }
  };

  /**
   * Handle widget card edit click
   */
  const handleEditWidget = (widget) => {
    console.log('✏️ Editing widget:', widget.id);
    setSelectedWidgetId(widget.id);
    loadWidgetById(widget.id);
    
    // Scroll to prompt input
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle widget deletion
   */
  const handleDeleteWidget = async (widgetId) => {
    if (!confirm('Are you sure you want to delete this widget?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting widget:', widgetId);
      const response = await axios.delete(`/api/ai-chart/widgets/${widgetId}`);
      
      if (response.data.success) {
        console.log('✅ Widget deleted successfully');
        
        // Remove widget from local state
        setWidgets(widgets.filter(w => w.id !== widgetId));
        
        // Clear selection if deleted widget was selected
        if (selectedWidgetId === widgetId) {
          setSelectedWidgetId(null);
          setChartData(null);
        }
        
        showToast('Widget deleted successfully', 'success');
      }
    } catch (err) {
      console.error('❌ Error deleting widget:', err);
      showToast('Failed to delete widget', 'error');
    }
  };

  /**
   * Handle create new widget
   */
  const handleCreateNew = () => {
    console.log('➕ Creating new widget');
    setSelectedWidgetId(null);
    setChartData(null);
    setError(null);
    
    // Scroll to prompt input
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle widget selection from edit dropdown
   */
  const handleSelectWidgetForEdit = (widgetId) => {
    setSelectedWidgetId(widgetId);
    loadWidgetById(widgetId);
  };

  /**
   * Handle clear widget selection
   */
  const handleClearSelection = () => {
    console.log('❌ Clearing selection');
    setSelectedWidgetId(null);
    setChartData(null);
  };

  /**
   * Handle prompt submission
   */
  const handleSubmit = async (prompt) => {
    setIsLoading(true);
    setError(null);

    try {
      const isNew = selectedWidgetId === null;
      
      console.log('📤 Submitting prompt:', {
        prompt: prompt.substring(0, 50) + '...',
        isNew,
        widgetId: selectedWidgetId
      });
      
      const payload = {
        prompt,
        isNew,
        ...(isNew ? {} : { widgetId: selectedWidgetId })
      };

      const response = await axios.post('/api/ai-chart', payload);

      if (response.data.success) {
        console.log('✅ Chart generated successfully');
        
        const newChartData = {
          widgetId: response.data.widgetId,
          widgetName: response.data.widgetName || response.data.name,
          prompt: response.data.prompt,
          vegaSpec: response.data.vegaSpec,
          data: response.data.vegaSpec.data.values,
          analysis: response.data.analysis,
          dataCount: response.data.vegaSpec.data.values.length,
          sql: response.data.sqlQuery || ''
        };
        
        setChartData(newChartData);
        
        if (isNew && response.data.widgetId) {
          setSelectedWidgetId(response.data.widgetId);
          
          // Reload all widgets to get fresh data from server
          console.log('🔄 Reloading widgets after creation...');
          await loadAllWidgets();
          
          // Clear selection and scroll to dashboard to show new widget
          setTimeout(() => {
            setSelectedWidgetId(null);
            setChartData(null);
            // Scroll to dashboard section smoothly
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }, 500);
        } else {
          console.log('✏️ Updating widget in list:', selectedWidgetId);
          setWidgets(widgets.map(w => 
            w.id === selectedWidgetId 
              ? { 
                  ...w, 
                  name: response.data.widgetName || response.data.name,
                  prompt: response.data.prompt,
                  vegaSpec: response.data.vegaSpec,
                  analysis: response.data.analysis,
                  sqlQuery: response.data.sqlQuery,
                  updatedAt: new Date().toISOString()
                }
              : w
          ));
          
          // Reload widgets after update to ensure fresh data
          await loadAllWidgets();
        }
        
        showToast(
          isNew ? 'New widget created successfully!' : 'Widget updated successfully!',
          'success'
        );
      } else {
        setError(response.data.message || 'Failed to generate chart');
      }
    } catch (err) {
      console.error('❌ Error submitting prompt:', err);
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      showToast('Failed to generate chart', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle example prompt selection
   */
  const handleExampleClick = (prompt) => {
    handleSubmit(prompt);
  };

  /**
   * Show toast notification
   */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  /**
   * Close toast
   */
  const closeToast = () => {
    setToast(null);
  };

  /**
   * Handle retry after error
   */
  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Widget Edit Mode Selector (only shown when editing) */}
          {selectedWidgetId && (
            <section>
              <WidgetSelector
                widgets={widgets}
                selectedWidgetId={selectedWidgetId}
                onSelectWidget={handleSelectWidgetForEdit}
                onClearSelection={handleClearSelection}
                isLoading={isLoading}
              />
            </section>
          )}

          {/* Prompt Input Section */}
          <section>
            <PromptInput onSubmit={handleSubmit} isLoading={isLoading} />
          </section>

          {/* Loading State for Widget Load */}
          {isLoadingWidget && (
            <section>
              <div className="card">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading widget...</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Chart Display / Loading / Error Section (only show when editing) */}
          {!isLoadingWidget && selectedWidgetId && (
            <section>
              {isLoading && <LoadingState />}
              
              {!isLoading && error && (
                <ErrorDisplay
                  error={error}
                  onRetry={handleRetry}
                  suggestions={[
                    'Try rephrasing your query',
                    'Check if the table or column names are correct',
                    'Use simpler queries',
                  ]}
                />
              )}

              {!isLoading && !error && chartData && (
                <ChartDisplay
                  chartData={chartData}
                  onCopy={(msg) => showToast(msg, 'success')}
                  onDownload={(msg) => showToast(msg, 'success')}
                />
              )}
            </section>
          )}

          {/* Widgets Dashboard (only show when not editing) */}
          {!selectedWidgetId && !isLoadingWidget && (
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

          {/* Example Prompts Section */}
          <section>
            <ExamplePrompts
              onSelectPrompt={handleExampleClick}
              isLoading={isLoading}
            />
          </section>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
}

export default App;
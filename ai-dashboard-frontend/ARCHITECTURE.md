# 🏗 Architecture Documentation

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          App.jsx                             │
│                    (Main Container)                          │
│                                                              │
│  - Orchestrates all components                              │
│  - Manages global state via useChartGenerator hook          │
│  - Handles routing between different views                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌────────────────┐
│   Header     │ │  Toast   │ │ PromptInput    │
│              │ │          │ │                │
│ - Logo       │ │ - Success│ │ - Validation   │
│ - Title      │ │ - Error  │ │ - Submit       │
│ - Tagline    │ │ - Info   │ │ - Character    │
└──────────────┘ └──────────┘ │   counter      │
                               └────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
            ┌──────────────┐  ┌─────────────┐  ┌──────────────┐
            │ LoadingState │  │ ChartDisplay│  │ ErrorDisplay │
            │              │  │             │  │              │
            │ - Animation  │  │ - Vega Chart│  │ - Message    │
            │ - Messages   │  │ - Metadata  │  │ - Retry      │
            │ - Progress   │  │ - SQL       │  │ - Suggestions│
            └──────────────┘  │ - Data Table│  └──────────────┘
                              │ - Export    │
                              └─────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                                   ▼
            ┌──────────────┐                   ┌──────────────┐
            │ExamplePrompts│                   │    Vega      │
            │              │                   │ (3rd party)  │
            │ - Categories │                   │              │
            │ - Examples   │                   │ - Renders    │
            │ - Tips       │                   │   charts     │
            └──────────────┘                   └──────────────┘
```

## Data Flow Architecture

```
┌─────────────┐
│    User     │
│  (Browser)  │
└──────┬──────┘
       │ Types query
       ▼
┌─────────────┐
│ PromptInput │
│  Component  │
└──────┬──────┘
       │ Validates & emits
       ▼
┌─────────────┐
│     App     │
│  Component  │
└──────┬──────┘
       │ Calls hook
       ▼
┌─────────────────┐
│useChartGenerator│
│      Hook       │
└──────┬──────────┘
       │ Makes API call
       ▼
┌─────────────┐
│ API Service │
│  (axios)    │
└──────┬──────┘
       │ HTTP POST
       ▼
┌─────────────┐
│   Backend   │
│   Server    │
│ (Port 5000) │
└──────┬──────┘
       │ Processes & responds
       ▼
┌─────────────┐
│   Vega-Lite │
│    Spec +   │
│    Data     │
└──────┬──────┘
       │ Returns to frontend
       ▼
┌─────────────┐
│ChartDisplay │
│  Component  │
└──────┬──────┘
       │ Renders
       ▼
┌─────────────┐
│  Vega Chart │
│  (Rendered) │
└─────────────┘
```

## File Structure & Responsibilities

### 📁 `/src/components/` - UI Components

Each component is self-contained and reusable:

```
components/
├── Header.jsx          # App header (presentational)
├── PromptInput.jsx     # Query input (interactive)
├── ChartDisplay.jsx    # Chart renderer (complex)
├── ExamplePrompts.jsx  # Quick-start examples (interactive)
├── LoadingState.jsx    # Loading animation (presentational)
├── ErrorDisplay.jsx    # Error messages (interactive)
└── Toast.jsx          # Notifications (presentational)
```

**Component Types:**

- **Presentational**: Display data, no logic (Header, LoadingState, Toast)
- **Interactive**: Handle user input (PromptInput, ExamplePrompts, ErrorDisplay)
- **Complex**: Multiple responsibilities (ChartDisplay)

### 📁 `/src/hooks/` - Custom Hooks

Reusable logic extracted from components:

```
hooks/
└── useChartGenerator.js   # Chart generation logic
    ├── State management
    ├── API calls
    ├── Error handling
    └── Success handling
```

**Why use hooks?**
- Separates logic from UI
- Reusable across components
- Easier to test
- Cleaner component code

### 📁 `/src/services/` - External Communication

Handles all backend communication:

```
services/
└── api.js
    ├── Axios configuration
    ├── Request interceptors
    ├── Response interceptors
    ├── Error handling
    └── API methods:
        ├── generateChart()
        ├── getPromptExamples()
        └── checkBackendHealth()
```

**Benefits:**
- Centralized API logic
- Easy to mock for testing
- Consistent error handling
- Request/response logging

### 📁 `/src/utils/` - Helper Functions

Pure utility functions:

```
utils/
└── index.js
    ├── formatNumber()        # Number formatting
    ├── formatDate()          # Date formatting
    ├── validatePrompt()      # Input validation
    ├── saveRecentPrompt()    # LocalStorage operations
    ├── copyToClipboard()     # Browser APIs
    └── downloadJSON()        # File downloads
```

**Characteristics:**
- Pure functions (no side effects)
- Testable in isolation
- No React dependencies
- Reusable everywhere

### 📁 `/src/constants/` - Configuration

Application-wide constants:

```
constants/
└── index.js
    ├── CHART_TYPES          # Available chart types
    ├── QUICK_PROMPTS        # Example queries
    ├── ERROR_MESSAGES       # Error text
    ├── UI_CONFIG            # UI settings
    ├── STORAGE_KEYS         # LocalStorage keys
    └── FEATURES             # Feature flags
```

**Why constants?**
- Single source of truth
- Easy to update
- No magic strings
- Type safety (with TypeScript)

### 📁 `/src/styles/` - Global Styles

```
styles/
└── index.css
    ├── Tailwind directives
    ├── Custom base styles
    ├── Component classes
    └── Utility classes
```

## State Management Strategy

### Local Component State
Used for UI-specific state:
```javascript
const [isExpanded, setIsExpanded] = useState(false);
```

### Custom Hook State
Used for business logic:
```javascript
const { isLoading, chartData, error } = useChartGenerator();
```

### Local Storage
Used for persistence:
```javascript
localStorage.setItem('recent_prompts', JSON.stringify(prompts));
```

### No Global State Management
- **Why?** App is simple enough
- **When to add?** If state needs to be shared across many components
- **Options:** Context API, Redux, Zustand

## API Communication Flow

```
Component → Hook → Service → Backend

Example:
PromptInput.onSubmit()
    ↓
App.handleSubmit()
    ↓
useChartGenerator.generateChart()
    ↓
api.generateChart()
    ↓
axios.post('/api/ai-chart', { prompt })
    ↓
Backend processes
    ↓
Response returns
    ↓
Hook updates state
    ↓
Component re-renders
```

## Error Handling Strategy

### Three Layers:

1. **Component Level**
   - Validates user input
   - Shows inline errors
   - Example: PromptInput validation

2. **Hook Level**
   - Handles API errors
   - Manages error state
   - Example: useChartGenerator try-catch

3. **Service Level**
   - Intercepts HTTP errors
   - Logs errors
   - Transforms error messages
   - Example: api.js interceptors

### Error Flow:

```
Error occurs in backend
    ↓
Axios catches HTTP error
    ↓
Service interceptor logs it
    ↓
Hook catches and updates state
    ↓
ErrorDisplay component shows message
    ↓
Toast notification appears
```

## Performance Optimizations

### Current:
- Vite for fast builds
- Code splitting (automatic)
- Lazy loading (potential)
- Memoization where needed

### Future Enhancements:
- React.lazy for code splitting
- useMemo for expensive calculations
- useCallback for stable function references
- Virtual scrolling for large data tables
- Service worker for offline support

## Security Considerations

### Implemented:
- Input validation
- Character limits
- No eval() usage
- Safe localStorage usage

### To Consider:
- XSS prevention (React does this)
- CSRF tokens for API calls
- Rate limiting on client side
- Sanitize user inputs before API calls

## Accessibility Features

### Current:
- Semantic HTML
- Keyboard navigation
- Focus management
- ARIA labels (where needed)

### To Improve:
- Screen reader support
- High contrast mode
- Reduced motion support
- Better focus indicators

## Testing Strategy

### Unit Tests (Recommended):
```javascript
// Test utilities
describe('formatNumber', () => {
  it('formats numbers with commas', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });
});

// Test hooks
describe('useChartGenerator', () => {
  it('handles successful chart generation', async () => {
    // Test logic
  });
});
```

### Integration Tests:
- Test component interactions
- Test API calls with mocked backend
- Test user workflows

### E2E Tests (Optional):
- Use Cypress or Playwright
- Test complete user journeys
- Test across browsers

## Deployment Architecture

```
Development:
Vite Dev Server (localhost:3000)
    ↓
Backend (localhost:5000)
    ↓
PostgreSQL Database

Production:
Static Files (Netlify/Vercel)
    ↓
Backend API (Heroku/AWS)
    ↓
PostgreSQL Database (Cloud)
```

## Future Scaling Considerations

When app grows, consider:

1. **State Management**: Add Redux or Zustand
2. **Routing**: Add React Router for multiple pages
3. **Code Splitting**: Lazy load components
4. **API Caching**: Use React Query or SWR
5. **TypeScript**: Add type safety
6. **Testing**: Add comprehensive test suite
7. **Monitoring**: Add error tracking (Sentry)
8. **Analytics**: Track user behavior

---

This architecture is designed to be:
- ✅ **Scalable**: Easy to add new features
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Testable**: Pure functions and isolated logic
- ✅ **Performant**: Optimized builds and rendering
- ✅ **Developer-friendly**: Clear structure and documentation

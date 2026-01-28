# 📚 Quick Reference Guide

Essential information for working with the AI Dashboard frontend.

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Quick start (Linux/Mac)
./start.sh
```

## 📁 Key Files & What They Do

### Root Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `vite.config.js` | Build tool configuration |
| `tailwind.config.js` | Styling configuration |
| `postcss.config.js` | CSS processing |
| `.eslintrc.cjs` | Code quality rules |
| `index.html` | HTML template |

### Source Files (`src/`)

| File/Folder | Purpose | Key Exports |
|-------------|---------|-------------|
| `main.jsx` | App entry point | - |
| `App.jsx` | Main component | `<App />` |
| `components/` | UI components | Multiple components |
| `hooks/` | Custom React hooks | `useChartGenerator` |
| `services/` | API communication | `generateChart()`, `getPromptExamples()` |
| `utils/` | Helper functions | Various utilities |
| `constants/` | App configuration | Constants |
| `styles/` | Global CSS | - |

## 🎨 Component Import Map

```javascript
// Components
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import ChartDisplay from './components/ChartDisplay';
import ExamplePrompts from './components/ExamplePrompts';
import LoadingState from './components/LoadingState';
import ErrorDisplay from './components/ErrorDisplay';
import Toast from './components/Toast';

// Hooks
import useChartGenerator from './hooks/useChartGenerator';

// Services
import { generateChart, getPromptExamples } from './services/api';

// Utils
import { formatNumber, formatDate, validatePrompt } from './utils';

// Constants
import { CHART_TYPES, QUICK_PROMPTS, UI_CONFIG } from './constants';
```

## 🔧 Common Code Patterns

### Making an API Call

```javascript
import { generateChart } from './services/api';

const handleSubmit = async (prompt) => {
  try {
    const result = await generateChart(prompt);
    console.log(result.vegaSpec);
  } catch (error) {
    console.error(error.message);
  }
};
```

### Using the Chart Generator Hook

```javascript
import useChartGenerator from './hooks/useChartGenerator';

function MyComponent() {
  const { 
    isLoading, 
    chartData, 
    error, 
    generateChart 
  } = useChartGenerator();

  return (
    <div>
      {isLoading && <LoadingState />}
      {error && <ErrorDisplay error={error} />}
      {chartData && <ChartDisplay chartData={chartData} />}
    </div>
  );
}
```

### Creating a New Component

```javascript
/**
 * MyComponent
 * 
 * Description of what this component does
 */
import React from 'react';

const MyComponent = ({ prop1, prop2, onAction }) => {
  // Component logic here
  
  return (
    <div className="card">
      {/* JSX here */}
    </div>
  );
};

export default MyComponent;
```

### Adding a New Utility Function

```javascript
// In src/utils/index.js

/**
 * Description of what function does
 * 
 * @param {type} param - Description
 * @returns {type} Description
 */
export const myUtility = (param) => {
  // Function logic
  return result;
};
```

## 🎨 Styling Guide

### Using Tailwind Classes

```javascript
// Basic styling
<div className="bg-white p-4 rounded-lg shadow-md">

// Responsive styling
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Hover effects
<button className="bg-blue-500 hover:bg-blue-600 transition-colors">

// Custom classes from index.css
<div className="card">              // Pre-defined card style
<button className="btn-primary">   // Pre-defined button style
```

### Color Palette

```javascript
// Primary colors
bg-primary-50   // Lightest
bg-primary-100
bg-primary-200
bg-primary-300
bg-primary-400
bg-primary-500  // Base
bg-primary-600  // Most used
bg-primary-700
bg-primary-800
bg-primary-900  // Darkest

// Semantic colors
bg-green-500    // Success
bg-red-500      // Error
bg-yellow-500   // Warning
bg-blue-500     // Info
```

## 🔌 API Endpoints

| Method | Endpoint | Purpose | Body |
|--------|----------|---------|------|
| POST | `/api/ai-chart` | Generate chart | `{ prompt: string }` |
| GET | `/api/ai-chart/examples` | Get examples | - |

### Request Example

```javascript
// Generate chart
const response = await fetch('/api/ai-chart', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    prompt: 'Show total sales by category' 
  })
});

const data = await response.json();
```

### Response Structure

```javascript
{
  success: true,
  prompt: "Show total sales by category",
  analysis: {
    table: "sales",
    chartType: "bar",
    groupBy: "category",
    aggregation: "sum",
    // ...
  },
  sql: "SELECT ...",
  dataCount: 5,
  data: [ /* array of objects */ ],
  vegaSpec: { /* Vega-Lite specification */ }
}
```

## 📊 Vega-Lite Chart Configuration

### Basic Structure

```javascript
{
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  width: 700,
  height: 400,
  data: { values: [...] },
  mark: { type: 'bar', tooltip: true },
  encoding: {
    x: { field: 'category', type: 'nominal' },
    y: { field: 'total', type: 'quantitative' }
  }
}
```

### Supported Chart Types

- `bar` - Bar chart
- `line` - Line chart
- `arc` - Pie chart
- `point` - Scatter plot
- `area` - Area chart

## 🔍 Debugging Tips

### Enable Verbose Logging

```javascript
// In src/services/api.js
console.log('🐛 Request:', config);
console.log('🐛 Response:', response.data);
```

### Check State in Components

```javascript
console.log('Current state:', { isLoading, chartData, error });
```

### Inspect Vega Spec

```javascript
console.log('Vega spec:', JSON.stringify(vegaSpec, null, 2));
```

### Common Console Commands

```javascript
// In browser console (F12)

// Check if React is loaded
React

// Get root component props
$r.props

// Check local storage
localStorage.getItem('ai_dashboard_recent_prompts')
```

## 🐛 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Dependencies not found | `npm install` |
| Styles not applying | Restart dev server |
| Backend connection error | Check backend is running on port 5000 |
| Chart not rendering | Check browser console for Vega errors |
| Build fails | `rm -rf node_modules && npm install` |

## 📝 Code Style Guidelines

### Naming Conventions

```javascript
// Components: PascalCase
const MyComponent = () => {};

// Functions: camelCase
const handleSubmit = () => {};

// Constants: UPPER_SNAKE_CASE
const API_URL = '...';

// Files: Same as export
MyComponent.jsx
useMyHook.js
myUtility.js
```

### File Structure

```javascript
// 1. Imports
import React from 'react';
import { Icon } from 'lucide-react';

// 2. Component definition
const MyComponent = ({ props }) => {
  // 3. State and hooks
  const [state, setState] = useState();
  
  // 4. Functions
  const handleAction = () => {};
  
  // 5. JSX return
  return <div>...</div>;
};

// 6. Export
export default MyComponent;
```

### Comments

```javascript
// Use JSDoc for functions
/**
 * Description
 * @param {type} param - Description
 * @returns {type} Description
 */

// Use inline comments for complex logic
// Calculate total revenue by multiplying price and quantity
const total = price * quantity;
```

## 🚀 Performance Tips

```javascript
// 1. Memoize expensive calculations
const expensiveValue = useMemo(() => calculate(), [deps]);

// 2. Prevent unnecessary re-renders
const handleClick = useCallback(() => {}, [deps]);

// 3. Lazy load heavy components
const HeavyComponent = React.lazy(() => import('./Heavy'));

// 4. Optimize images
<img loading="lazy" alt="..." />
```

## 🔐 Environment Variables

```bash
# Create .env file
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=AI Dashboard

# Access in code
const apiUrl = import.meta.env.VITE_API_URL;
```

## 📦 Adding New Dependencies

```bash
# Install and save to package.json
npm install package-name

# Install dev dependency
npm install -D package-name

# Uninstall
npm uninstall package-name
```

## 🎯 Feature Development Checklist

When adding a new feature:

- [ ] Plan component structure
- [ ] Create component file(s)
- [ ] Add necessary hooks/utils
- [ ] Update constants if needed
- [ ] Add styles
- [ ] Test in browser
- [ ] Add error handling
- [ ] Update documentation
- [ ] Check mobile responsiveness
- [ ] Verify accessibility

## 📞 Getting Help

1. **Check documentation**: README.md, SETUP.md, ARCHITECTURE.md
2. **Browser console**: F12 to see errors
3. **Terminal output**: Check `npm run dev` logs
4. **Backend logs**: Check backend terminal
5. **Official docs**: React, Vite, Tailwind, Vega-Lite

---

**Keep this guide handy while developing! 🎉**

# AI Dashboard Frontend 🚀

A modern, responsive React application that generates dynamic data visualizations from natural language queries using AI-powered backend processing.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [Architecture](#architecture)
- [Components](#components)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- 🎯 **Natural Language Queries**: Type questions in plain English to generate charts
- 📊 **Dynamic Visualizations**: Automatic chart generation using Vega-Lite
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- ⚡ **Real-time Processing**: Fast chart generation with loading states
- 📱 **Fully Responsive**: Works perfectly on desktop, tablet, and mobile
- 💾 **Data Export**: Download chart data and SQL queries
- 🔄 **Smart Caching**: Recent prompts saved locally for quick access
- 🎭 **Error Handling**: User-friendly error messages with helpful suggestions
- 🌈 **Multiple Chart Types**: Bar, line, pie, scatter, and area charts

## 🛠 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Vega-Lite** - Declarative visualization grammar
- **Axios** - HTTP client for API requests
- **Lucide React** - Beautiful icons

## 📁 Project Structure

```
ai-dashboard-frontend/
├── src/
│   ├── components/           # React components
│   │   ├── Header.jsx       # App header with branding
│   │   ├── PromptInput.jsx  # Query input field
│   │   ├── ChartDisplay.jsx # Vega-Lite chart renderer
│   │   ├── ExamplePrompts.jsx # Quick-start examples
│   │   ├── LoadingState.jsx # Loading animation
│   │   ├── ErrorDisplay.jsx # Error messages
│   │   └── Toast.jsx        # Notification toasts
│   ├── hooks/               # Custom React hooks
│   │   └── useChartGenerator.js # Chart generation logic
│   ├── services/            # API communication
│   │   └── api.js          # Backend API service
│   ├── utils/              # Utility functions
│   │   └── index.js        # Helper functions
│   ├── constants/          # App constants
│   │   └── index.js        # Configuration values
│   ├── styles/             # Global styles
│   │   └── index.css       # Tailwind + custom CSS
│   ├── App.jsx             # Main app component
│   └── main.jsx            # App entry point
├── public/                 # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
└── postcss.config.js      # PostCSS configuration
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Backend server** running on `http://localhost:5000`

Check your versions:
```bash
node --version  # Should be v16+
npm --version   # Should be 7+
```

## 🚀 Installation

1. **Navigate to the frontend directory**:
```bash
cd ai-dashboard-frontend
```

2. **Install dependencies**:
```bash
npm install
```

This will install all required packages including:
- React and React DOM
- Vite
- Tailwind CSS
- Vega-Lite and react-vega
- Axios
- Lucide React icons

## ▶️ Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The application will open automatically at `http://localhost:3000`

### Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 📖 Usage Guide

### Basic Usage

1. **Start the application**: Run `npm run dev`
2. **Enter a query**: Type a natural language question in the input field
   - Example: "Show total sales by category"
3. **Generate chart**: Click "Generate Chart" or press Enter
4. **View results**: The chart will appear with metadata and export options

### Example Queries

#### Sales Analytics
- "Show total sales by category"
- "Top 5 products by revenue"
- "Average sales amount by region"
- "Sales trend over time"

#### User Analytics
- "User distribution by country"
- "Average age by country"
- "How many users per subscription tier?"
- "Show users by city"

#### Product Analytics
- "Show products by category"
- "Average price by category"
- "Total inventory by supplier"
- "Top 10 most expensive products"

### Features in Detail

#### 1. Query Input
- Type naturally (no SQL knowledge needed)
- Character counter shows remaining space
- Real-time validation
- Keyboard shortcuts (Enter to submit)

#### 2. Chart Display
- Interactive Vega-Lite visualizations
- Hover tooltips for data points
- Zoom and pan controls
- Export to PNG/SVG

#### 3. Data Management
- View generated SQL query
- Download raw data as JSON
- Copy Vega-Lite specification
- Preview data table

#### 4. Recent Prompts
- Automatically saved to local storage
- Quick access to previous queries
- Maximum 10 recent prompts stored

## 🏗 Architecture

### Component Hierarchy

```
App (Smart Component)
├── Header (Presentational)
├── PromptInput (Interactive)
├── LoadingState (Presentational)
├── ErrorDisplay (Interactive)
├── ChartDisplay (Complex)
│   ├── Vega Chart
│   ├── Metadata
│   ├── SQL Display
│   └── Data Table
├── ExamplePrompts (Interactive)
└── Toast (Presentational)
```

### Data Flow

1. User enters query → PromptInput
2. PromptInput validates → calls App.handleSubmit()
3. App → useChartGenerator hook → API service
4. API service → Backend server
5. Backend → Returns Vega spec + data
6. App updates state → ChartDisplay renders

### State Management

- **Local component state**: UI-specific state (expanded/collapsed, etc.)
- **Custom hook**: Business logic state (loading, data, errors)
- **Local storage**: Persistent data (recent prompts, preferences)

## 🎨 Components

### Core Components

#### Header
- Displays app branding
- Shows tagline
- Sticky position for always-visible navigation

#### PromptInput
- Text input with validation
- Character counter
- Loading state handling
- Enter key support

#### ChartDisplay
- Renders Vega-Lite charts
- Shows metadata (data count, chart type, etc.)
- Displays SQL query
- Data preview table
- Export buttons

#### ExamplePrompts
- Categorized example queries
- Collapsible sections
- One-click query execution
- Help tips

#### LoadingState
- Animated loading indicator
- Rotating status messages
- Progress indicator

#### ErrorDisplay
- User-friendly error messages
- Retry button
- Helpful suggestions
- Contextual tips

#### Toast
- Success/error notifications
- Auto-dismiss after timeout
- Close button
- Animated entry/exit

### Custom Hooks

#### useChartGenerator
- Manages chart generation state
- Handles API communication
- Error handling
- Recent prompts management

## 🎨 Customization

### Styling

#### Colors
Edit `tailwind.config.js` to change the color scheme:

```javascript
colors: {
  primary: {
    500: '#0ea5e9',  // Change primary color
    // ... other shades
  },
}
```

#### Fonts
Modify `src/styles/index.css`:

```css
body {
  font-family: 'Your Font', sans-serif;
}
```

### Configuration

#### API Endpoint
Change backend URL in `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://your-backend-url:5000',
  }
}
```

#### Constants
Edit `src/constants/index.js` to modify:
- Maximum prompt length
- Toast duration
- Recent prompts limit
- Feature flags

### Adding New Features

#### New Chart Type
1. Add to `CHART_TYPES` in `constants/index.js`
2. Update backend analysis logic
3. Add example prompts

#### New Data Source
1. Update backend models
2. Add examples in `ExamplePrompts.jsx`
3. Update help documentation

## 🐛 Troubleshooting

### Common Issues

#### 1. Backend Connection Error
**Problem**: "Unable to connect to the server"

**Solution**:
- Ensure backend is running on port 5000
- Check `vite.config.js` proxy settings
- Verify no firewall blocking

#### 2. Charts Not Rendering
**Problem**: Chart area is blank

**Solution**:
- Check browser console for errors
- Verify Vega-Lite spec is valid
- Ensure data format is correct

#### 3. Build Errors
**Problem**: `npm run build` fails

**Solution**:
```bash
# Clear cache
rm -rf node_modules package-lock.json
# Reinstall
npm install
# Try again
npm run build
```

#### 4. Styling Issues
**Problem**: Tailwind classes not applying

**Solution**:
- Verify `postcss.config.js` exists
- Check `tailwind.config.js` content paths
- Restart dev server

### Debug Mode

Enable detailed logging by adding to `src/services/api.js`:

```javascript
apiClient.interceptors.request.use(
  (config) => {
    console.log('🐛 DEBUG:', config);
    return config;
  }
);
```

## 🤝 Contributing

This is a foundational structure designed for enhancement. Potential improvements:

- [ ] User authentication
- [ ] Save/share charts
- [ ] Chart customization UI
- [ ] Dark mode
- [ ] More chart types
- [ ] Export to PowerPoint
- [ ] Real-time collaboration
- [ ] Chart history/versioning

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- Vega-Lite for visualization grammar
- Tailwind CSS for styling system
- React team for the awesome framework
- Lucide for beautiful icons

---

**Happy Coding! 🎉**

For questions or issues, check the troubleshooting section or refer to the component documentation.

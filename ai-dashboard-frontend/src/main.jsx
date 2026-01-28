/**
 * Main Entry Point
 * 
 * This file is the entry point for the React application.
 * It:
 * 1. Imports React and ReactDOM
 * 2. Imports the main App component
 * 3. Imports global styles
 * 4. Renders the App component into the DOM
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

// Get the root element from HTML
// This is the <div id="root"></div> in index.html
const rootElement = document.getElementById('root');

// Create a React root
// This is the new way to render React apps (React 18+)
const root = ReactDOM.createRoot(rootElement);

// Render the App component
// StrictMode helps identify potential problems in the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

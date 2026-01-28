import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for React app
// https://vitejs.dev/config/
export default defineConfig({
  // Use React plugin for JSX transformation
  plugins: [react()],
  
  // Server configuration for development
  server: {
    port: 3000,              // Frontend will run on port 3000
    open: true,              // Automatically open browser
    proxy: {
      // Proxy API requests to backend
      // When you call '/api/...' from frontend, it will forward to backend
      '/api': {
        target: 'http://localhost:5000',  // Your backend server
        changeOrigin: true,               // Needed for virtual hosted sites
        secure: false                     // If backend uses HTTPS
      }
    }
  },
  
  // Build configuration for production
  build: {
    outDir: 'dist',          // Output directory for build files
    sourcemap: true,         // Generate source maps for debugging
    minify: 'terser'         // Minify code for production
  }
})

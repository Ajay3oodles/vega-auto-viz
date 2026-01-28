# 🚀 Complete Setup Guide - AI Dashboard

This guide will walk you through setting up both the backend and frontend of the AI Dashboard application.

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- ✅ **Node.js** v16+ installed ([Download](https://nodejs.org/))
- ✅ **PostgreSQL** database installed and running
- ✅ **Git** (optional, for version control)
- ✅ **Code editor** (VS Code recommended)

## 🗂 Project Structure Overview

```
project-root/
├── backend/                  # Your existing backend
│   ├── models/
│   │   ├── User.js
│   │   ├── Sale.js
│   │   └── Product.js
│   ├── controllers/
│   │   └── aiChartController.js
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   └── server.js
│
└── ai-dashboard-frontend/    # New frontend (this folder)
    ├── src/
    ├── public/
    ├── package.json
    └── vite.config.js
```

## 🔧 Backend Setup

### Step 1: Verify Backend Structure

Ensure your backend has these routes configured:

```javascript
// In your backend routes file (e.g., routes/index.js)
import { generateChartFromPrompt, getPromptExamples } from './controllers/aiChartController.js';

router.post('/api/ai-chart', generateChartFromPrompt);
router.get('/api/ai-chart/examples', getPromptExamples);
```

### Step 2: Start Backend Server

```bash
cd backend
npm install  # If not already done
npm start    # Should run on port 5000
```

Verify backend is running:
- Open browser: `http://localhost:5000/api/ai-chart/examples`
- Should see JSON with example prompts

## 💻 Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd ai-dashboard-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- Vega-Lite (charts)
- Axios (API calls)
- Lucide React (icons)

**Installation time**: ~2-3 minutes depending on internet speed

### Step 3: Verify Installation

Check if dependencies installed correctly:

```bash
npm list --depth=0
```

You should see all packages listed without errors.

### Step 4: Start Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in 450 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 5: Open Application

1. Browser should open automatically at `http://localhost:3000`
2. If not, manually open: `http://localhost:3000`

## ✅ Verification Steps

### 1. Check Both Servers Running

- **Backend**: `http://localhost:5000/api/ai-chart/examples` → Should show JSON
- **Frontend**: `http://localhost:3000` → Should show UI

### 2. Test API Connection

In frontend:
1. Click any example prompt (e.g., "Show total sales by category")
2. Should see loading animation
3. Chart should appear within 2-5 seconds

### 3. Check Browser Console

Open browser DevTools (F12):
- Should see logs like:
  ```
  🚀 API Request: POST /api/ai-chart
  ✅ API Response: /api/ai-chart 200
  ```

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module 'vite'"

**Cause**: Dependencies not installed

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: "Backend connection failed"

**Cause**: Backend not running or wrong port

**Solution**:
1. Check backend is running: `http://localhost:5000`
2. Verify `vite.config.js` proxy settings:
   ```javascript
   proxy: {
     '/api': {
       target: 'http://localhost:5000',  // Match your backend port
     }
   }
   ```

### Issue 3: "Tailwind styles not applying"

**Cause**: PostCSS not configured

**Solution**:
```bash
npm install -D tailwindcss postcss autoprefixer
```

Then restart dev server:
```bash
npm run dev
```

### Issue 4: Charts not rendering

**Cause**: Vega-Lite not loaded

**Solution**:
```bash
npm install vega vega-lite react-vega
npm run dev
```

### Issue 5: CORS errors

**Cause**: Backend not allowing frontend origin

**Solution**: Add CORS to backend:
```javascript
// In backend server.js
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## 📱 Testing the Application

### Test Case 1: Basic Query
1. Type: "Show total sales by category"
2. Click "Generate Chart"
3. **Expected**: Bar chart showing sales by category

### Test Case 2: Custom Query
1. Type: "Top 5 products by revenue"
2. Submit
3. **Expected**: Chart with 5 products

### Test Case 3: Error Handling
1. Type: "xyz abc 123" (invalid query)
2. Submit
3. **Expected**: Error message with suggestions

### Test Case 4: Example Prompts
1. Click "Sales Analytics" category
2. Click "Sales trend over time"
3. **Expected**: Line chart showing sales over time

## 🏗 Development Workflow

### Daily Development

1. **Start backend**:
```bash
cd backend
npm start
```

2. **Start frontend** (new terminal):
```bash
cd ai-dashboard-frontend
npm run dev
```

3. **Make changes**: Edit files in `src/`
4. **See updates**: Browser auto-refreshes

### Before Committing

```bash
# Run linter
npm run lint

# Build to check for errors
npm run build

# Preview production build
npm run preview
```

## 📦 Production Build

### Step 1: Build Frontend

```bash
cd ai-dashboard-frontend
npm run build
```

Creates optimized files in `dist/` folder.

### Step 2: Preview Build

```bash
npm run preview
```

Opens production build at `http://localhost:4173`

### Step 3: Deploy

Copy contents of `dist/` folder to your web server.

## 🔐 Environment Variables (Optional)

Create `.env` file in frontend root:

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=AI Dashboard
```

Use in code:
```javascript
const API_URL = import.meta.env.VITE_API_URL;
```

## 📊 Monitoring

### Development Console

Watch logs in terminal running `npm run dev`:
- Hot reload notifications
- Build errors
- Warnings

### Browser Console

Open DevTools (F12) to see:
- API requests/responses
- React warnings
- Custom console logs

## 🎓 Next Steps

Now that setup is complete:

1. **Explore Components**: Look at `src/components/` files
2. **Understand Data Flow**: Read `src/hooks/useChartGenerator.js`
3. **Customize Styling**: Edit `tailwind.config.js`
4. **Add Features**: Check README for enhancement ideas

## 📚 Helpful Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Clean install
rm -rf node_modules package-lock.json && npm install
```

## 🆘 Getting Help

### Resources
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Vega-Lite**: https://vega.github.io/vega-lite

### Debug Mode

Add to `src/main.jsx` for verbose logging:
```javascript
if (import.meta.env.DEV) {
  console.log('🐛 Debug mode enabled');
}
```

---

**🎉 Congratulations!** You're all set up and ready to build amazing data visualizations!

If you encounter any issues not covered here, check:
1. Browser console (F12)
2. Terminal running `npm run dev`
3. Backend terminal logs

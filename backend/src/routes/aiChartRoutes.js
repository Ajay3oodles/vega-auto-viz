// routes/aiChartRoutes.js
// AI-powered chart generation routes

import express from 'express';
import {
  generateChartFromPrompt,
  getPromptExamples,
  getLastSavedWidget
} from '../controllers/aiChartController.js';

const router = express.Router();

router.post('/', generateChartFromPrompt);          // POST /api/ai-chart
router.get('/examples', getPromptExamples);         // GET  /api/ai-chart/examples
router.get('/widgets/last', getLastSavedWidget);    // GET  /api/ai-chart/widgets/last


export default router;
// routes/aiChartRoutes.js
// AI-powered chart generation routes

import express from 'express';
import {
  generateChartFromPrompt,
  getPromptExamples
} from '../controllers/aiChartController.js';

const router = express.Router();

// Generate chart from natural language prompt
router.post('/', generateChartFromPrompt);       // POST /api/ai-chart

// Get prompt examples
router.get('/examples', getPromptExamples);      // GET /api/ai-chart/examples

export default router;
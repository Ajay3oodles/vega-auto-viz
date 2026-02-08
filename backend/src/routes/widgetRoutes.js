import express from 'express';
import {
  getAllWidgets,
  getAllWidgetsFullData,
  getWidgetDetails,
  deleteWidget // ✅ Import the new controller
} from '../controllers/widgetController.js';

const router = express.Router();

/**
 * IMPORTANT:
 * Static routes FIRST, dynamic routes LAST
 */

router.get('/widgets', getAllWidgets); // list (id + name)
router.get('/widgets/full', getAllWidgetsFullData); // full dashboard data

// ✅ A clean way to group routes for the same path
router
  .route('/widgets/:id')
  .get(getWidgetDetails) // GET /api/ai-chart/widgets/:id
  .delete(deleteWidget); // DELETE /api/ai-chart/widgets/:id

export default router;
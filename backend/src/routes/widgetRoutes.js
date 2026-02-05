import express from 'express';
import {

  getAllWidgets,
  getWidgetDetails
} from '../controllers/widgetController.js';

const router = express.Router();

router.get('/widgets', getAllWidgets);           // 👈 list (id + name)
router.get('/widgets/:id', getWidgetDetails);    // 👈 widget by id

export default router;

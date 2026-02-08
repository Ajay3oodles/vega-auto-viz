// controllers/widgetController.js

import {
  getAllWidgetsList,
  getAllWidgetsFull,
  getWidgetById,
  deleteWidgetById
} from '../services/widgetService.js';

/**
 * Get all widgets (id + name only)
 * GET /api/ai-chart/widgets
 */
export const getAllWidgets = async (req, res) => {
  try {
    const widgets = await getAllWidgetsList();

    res.status(200).json({
      success: true,
      count: widgets.length,
      widgets
    });
  } catch (error) {
    console.error('❌ Error fetching widgets list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch widgets list'
    });
  }
};

/**
 * Get all widgets with FULL DATA
 * GET /api/ai-chart/widgets/full
 */
export const getAllWidgetsFullData = async (req, res) => {
  try {
    const widgets = await getAllWidgetsFull();

    res.status(200).json({
      success: true,
      count: widgets.length,
      widgets
    });
  } catch (error) {
    console.error('❌ Error fetching full widgets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch widgets'
    });
  }
};

/**
 * Get widget by ID (DETAILS)
 * GET /api/ai-chart/widgets/:id
 */
export const getWidgetDetails = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid widget ID'
      });
    }

    const widget = await getWidgetById(id);

    if (!widget) {
      return res.status(404).json({
        success: false,
        message: 'Widget not found'
      });
    }

    res.status(200).json({
      success: true,
      widget
    });
  } catch (error) {
    console.error('❌ Error fetching widget by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch widget'
    });
  }
};



/**
 * ✅ NEW: Delete widget by ID
 * DELETE /api/ai-chart/widgets/:id
 */
export const deleteWidget = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid widget ID'
      });
    }

    const numDeleted = await deleteWidgetById(id);

    if (numDeleted === 0) {
      return res.status(404).json({
        success: false,
        message: `Widget with ID ${id} not found`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Widget deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting widget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete widget'
    });
  }
};

import {
  saveWidget,
  getLastWidget,
  getAllWidgetsList,
  getWidgetById
} from '../services/widgetService.js';


/**
 * Get all widgets (id + name only)
 * 
 * @route GET /api/ai-chart/widgets
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
 * Get widget by ID
 * 
 * @route GET /api/ai-chart/widgets/:id
 */
export const getWidgetDetails = async (req, res) => {
  try {
    const { id } = req.params;

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
    console.error('❌ Error fetching widget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch widget'
    });
  }
};

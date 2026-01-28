// services/widgetService.js
import Widget from '../models/Widget.js';

/**
 * Save widget and mark as last
 */
export async function saveWidget(widgetData) {
  // Unmark all as last
  await Widget.update({ isLastWidget: false }, { where: { isLastWidget: true } });
  
  // Create new widget marked as last
  return await Widget.create({
    name: widgetData.name || `Chart - ${new Date().toLocaleDateString()}`,
    prompt: widgetData.prompt,
    sqlQuery: widgetData.sqlQuery,
    vegaSpec: widgetData.vegaSpec,
    analysis: widgetData.analysis,
    isLastWidget: true
  });
}

/**
 * Get last saved widget
 */
export async function getLastWidget() {
  return await Widget.findOne({
    where: { isLastWidget: true },
    order: [['createdAt', 'DESC']]
  });
}
// services/widgetService.js

import models from '../models/index.js';
const { Widget } = models;

/**
 * Save widget
 * isNew = true  → ALWAYS create new widget
 * isNew = false → update existing widget by ID
 */
export async function saveWidget({
  isNew,
  widgetId,
  name,
  prompt,
  sqlQuery,
  vegaSpec,
  analysis
}) {
  console.log('💾 Saving widget...', { isNew, widgetId, name });

  // Unmark all previous widgets as "last"
  await Widget.update(
    { isLastWidget: false },
    { where: { isLastWidget: true } }
  );

  if (isNew) {
    // ✅ ALWAYS CREATE NEW WIDGET
    console.log('🆕 Creating NEW widget');
    const newWidget = await Widget.create({
      name: name || `Chart - ${new Date().toISOString().split('T')[0]}`,
      prompt,
      sqlQuery,
      vegaSpec,
      analysis,
      isLastWidget: true
    });
    console.log('✅ New widget created:', newWidget.id);
    return newWidget;
  }

  // ✏️ UPDATE EXISTING WIDGET
  if (!widgetId) {
    throw new Error('widgetId required when isNew=false');
  }

  console.log('✏️ Updating existing widget:', widgetId);
  const existingWidget = await Widget.findByPk(widgetId);

  if (!existingWidget) {
    throw new Error(`Widget ${widgetId} not found`);
  }

  await existingWidget.update({
    name,
    prompt,
    sqlQuery,
    vegaSpec,
    analysis,
    isLastWidget: true
  });

  console.log('✅ Widget updated:', widgetId);
  return existingWidget;
}

/**
 * Get last widget
 */
export async function getLastWidget() {
  return Widget.findOne({
    where: { isLastWidget: true },
    order: [['updatedAt', 'DESC']]
  });
}

/**
 * Get list of widgets (id + name only) - LIGHTWEIGHT
 */
export async function getAllWidgetsList() {
  return await Widget.findAll({
    attributes: ['id', 'name', 'createdAt'],
    order: [['updatedAt', 'DESC']]
  });
}

/**
 * ✅ NEW: Get all widgets with FULL data for dashboard
 */
export async function getAllWidgetsFull() {
  return Widget.findAll({
    order: [['updatedAt', 'DESC']]
  });
}

/**
 * Get full widget data by ID
 */
export async function getWidgetById(widgetId) {
  return await Widget.findByPk(widgetId);
}


/**
 * Delete a widget by its ID
 */
export async function deleteWidgetById(widgetId) {
  console.log('🗑️ Deleting widget:', widgetId);

  // The `destroy` method returns the number of rows deleted.
  const numDeletedRows = await Widget.destroy({
    where: { id: widgetId }
  });

  console.log(`✅ Rows deleted: ${numDeletedRows}`);
  return numDeletedRows;
}
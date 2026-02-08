// utils/labelFormatter.js
export function snakeToTitle(str = '') {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function beautifyVegaSpec(vegaSpec) {
  if (!vegaSpec?.encoding) return vegaSpec;

  const encoding = vegaSpec.encoding;

  // 1️⃣ Axis titles
  ['x', 'y'].forEach(channel => {
    if (encoding[channel]?.field) {
      encoding[channel].axis = {
        ...(encoding[channel].axis || {}),
        title: snakeToTitle(encoding[channel].field)
      };
    }
  });

  // 2️⃣ Explicit tooltip (THIS IS THE FIX)
  const tooltip = [];

  if (encoding.x?.field) {
    tooltip.push({
      field: encoding.x.field,
      type: encoding.x.type,
      title: snakeToTitle(encoding.x.field)
    });
  }

  if (encoding.y?.field) {
    tooltip.push({
      field: encoding.y.field,
      type: encoding.y.type,
      title: snakeToTitle(encoding.y.field)
    });
  }

  encoding.tooltip = tooltip;

  // 3️⃣ Remove auto-tooltip
  if (vegaSpec.mark?.tooltip) {
    delete vegaSpec.mark.tooltip;
  }

  return vegaSpec;
}

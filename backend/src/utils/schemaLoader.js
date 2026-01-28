// utils/schemaLoader.js
import sequelize from '../models/index.js';

export function loadSchema() {
  const models = sequelize.models;
  const schema = {};

  for (const modelName in models) {
    const model = models[modelName];
    const attrs = model.rawAttributes;

    schema[model.tableName] = Object.keys(attrs)
      .filter(c => !['createdAt', 'updatedAt'].includes(c));
  }

  return schema;
}

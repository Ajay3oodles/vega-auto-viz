import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Widget = sequelize.define(
  'Widget',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    name: {
      type: DataTypes.STRING,
      allowNull: true
    },

    prompt: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    sqlQuery: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'sql_query'
    },

    vegaSpec: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'vega_spec'
    },

    analysis: {
      type: DataTypes.JSONB,
      allowNull: true
    },

    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'created_by'
    },

    isLastWidget: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_last_widget'
    }
  },
  {
    tableName: 'widgets',
    timestamps: true,
    underscored: true
  }
);

export default Widget;

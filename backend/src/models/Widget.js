// models/widget.js
import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'Widget',
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },


      // userId: {
      //   type: DataTypes.UUID,
      //   allowNull: false,
      //   field: 'user_id'
      // },

      name: {
        type: DataTypes.STRING(150),
        allowNull: false
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
        allowNull: false
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


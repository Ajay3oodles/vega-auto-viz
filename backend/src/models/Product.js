import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },

      name: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      stockQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'stock_quantity'
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0
      }
    },
    {
      tableName: 'products',
      timestamps: true,
      underscored: true
    }
  );

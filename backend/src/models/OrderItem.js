import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'OrderItem',
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },

      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'order_id'
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'product_id'
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      }
    },
    {
      tableName: 'order_items',
      timestamps: true,
      underscored: true
    }
  );

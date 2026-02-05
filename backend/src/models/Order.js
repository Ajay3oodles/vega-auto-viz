import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'Order',
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },

      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id'
      },
      orderDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'order_date'
      },
      status: {
        type: DataTypes.STRING(50),
        defaultValue: 'pending'
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'total_amount'
      }
    },
    {
      tableName: 'orders',
      timestamps: true,
      underscored: true
    }
  );

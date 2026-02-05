import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },

      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      country: DataTypes.STRING(100),
      subscriptionTier: {
        type: DataTypes.STRING(50),
        defaultValue: 'free',
        field: 'subscription_tier'
      },
      signupDate: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
        field: 'signup_date'
      }
    },
    {
      tableName: 'users',
      timestamps: true,
      underscored: true
    }
  );

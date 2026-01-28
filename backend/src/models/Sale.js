import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Sale model - represents sales transactions
const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Foreign key to User model
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',            // Database column name (snake_case)
    references: {
      model: 'users',            // References 'users' table
      key: 'id'                  // References 'id' column
    }
  },
  
  productName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'product_name'
  },
  
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  
  // Decimal for money (10 digits total, 2 after decimal)
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,                    // Cannot be negative
      isDecimal: true            // Must be valid decimal
    }
  },
  
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1                     // At least 1 item
    }
  },
  
  saleDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'sale_date'
  },
  
  region: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isIn: [['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa']]
    }
  }
}, {
  tableName: 'sales',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },     // Index for faster user queries
    { fields: ['sale_date'] },   // Index for date range queries
    { fields: ['category'] }     // Index for category filtering
  ]
});

// Class Methods

/**
 * Get sales by date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise} Array of sales
 */
Sale.findByDateRange = async function(startDate, endDate) {
  return await this.findAll({
    where: {
      saleDate: {
        [sequelize.Op.between]: [startDate, endDate]  // SQL: BETWEEN startDate AND endDate
      }
    },
    order: [['saleDate', 'DESC']]
  });
};

/**
 * Get sales by category
 * @param {string} category - Category name
 * @returns {Promise} Array of sales
 */
Sale.findByCategory = async function(category) {
  return await this.findAll({
    where: { category }
  });
};

/**
 * Get total sales by region
 * @returns {Promise} Array of {region, totalAmount}
 */
Sale.getSalesByRegion = async function() {
  return await this.findAll({
    attributes: [
      'region',
      [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],  // SQL: SUM(amount)
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['region'],
    raw: true
  });
};

/**
 * Get sales statistics by category
 * @returns {Promise} Array of category statistics
 */
Sale.getCategoryStats = async function() {
  return await this.findAll({
    attributes: [
      'category',
      [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
      [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount'],
      [sequelize.fn('AVG', sequelize.col('amount')), 'avgAmount']
    ],
    group: ['category'],
    raw: true
  });
};

/**
 * Get monthly sales trend
 * @param {number} year - Year
 * @returns {Promise} Monthly sales data
 */
Sale.getMonthlySales = async function(year) {
  return await this.findAll({
    attributes: [
      [sequelize.fn('EXTRACT', sequelize.literal("MONTH FROM sale_date")), 'month'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: sequelize.where(
      sequelize.fn('EXTRACT', sequelize.literal("YEAR FROM sale_date")),
      year
    ),
    group: [sequelize.fn('EXTRACT', sequelize.literal("MONTH FROM sale_date"))],
    order: [[sequelize.fn('EXTRACT', sequelize.literal("MONTH FROM sale_date")), 'ASC']],
    raw: true
  });
};

// Instance Methods

/**
 * Calculate total price (amount * quantity)
 * @returns {number} Total price
 */
Sale.prototype.getTotalPrice = function() {
  return parseFloat(this.amount) * this.quantity;
};

/**
 * Check if sale is recent (within last 30 days)
 * @returns {boolean} True if recent
 */
Sale.prototype.isRecent = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(this.saleDate) >= thirtyDaysAgo;
};

/**
 * Get formatted sale information
 * @returns {Object} Formatted sale data
 */
Sale.prototype.getFormattedInfo = function() {
  return {
    id: this.id,
    product: this.productName,
    category: this.category,
    unitPrice: parseFloat(this.amount),
    quantity: this.quantity,
    totalPrice: this.getTotalPrice(),
    date: this.saleDate,
    region: this.region
  };
};

export default Sale;
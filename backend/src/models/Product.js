import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Product model - represents products in inventory
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,                // Product names must be unique
    validate: {
      notEmpty: true
    }
  },
  
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true
    }
  },
  
  stockQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'stock_quantity',
    validate: {
      min: 0                     // Cannot have negative stock
    }
  },
  
  supplier: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  // Virtual field - not stored in database
  // Computed on-the-fly when accessed
  inStock: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.stockQuantity > 0;
    }
  }
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    { fields: ['category'] },
    { fields: ['supplier'] },
    { fields: ['name'], unique: true }
  ]
});

// Class Methods

/**
 * Find products by category
 * @param {string} category - Category name
 * @returns {Promise} Array of products
 */
Product.findByCategory = async function(category) {
  return await this.findAll({
    where: { category },
    order: [['name', 'ASC']]
  });
};

/**
 * Find products by supplier
 * @param {string} supplier - Supplier name
 * @returns {Promise} Array of products
 */
Product.findBySupplier = async function(supplier) {
  return await this.findAll({
    where: { supplier }
  });
};

/**
 * Find products in stock
 * @returns {Promise} Array of in-stock products
 */
Product.findInStock = async function() {
  return await this.findAll({
    where: {
      stockQuantity: {
        [sequelize.Op.gt]: 0     // Greater than 0
      }
    }
  });
};

/**
 * Find products out of stock
 * @returns {Promise} Array of out-of-stock products
 */
Product.findOutOfStock = async function() {
  return await this.findAll({
    where: {
      stockQuantity: 0
    }
  });
};

/**
 * Find products in price range
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {Promise} Array of products
 */
Product.findByPriceRange = async function(minPrice, maxPrice) {
  return await this.findAll({
    where: {
      price: {
        [sequelize.Op.between]: [minPrice, maxPrice]
      }
    },
    order: [['price', 'ASC']]
  });
};

/**
 * Get inventory statistics by category
 * @returns {Promise} Category statistics
 */
Product.getCategoryStats = async function() {
  return await this.findAll({
    attributes: [
      'category',
      [sequelize.fn('COUNT', sequelize.col('id')), 'productCount'],
      [sequelize.fn('SUM', sequelize.col('stock_quantity')), 'totalStock'],
      [sequelize.fn('AVG', sequelize.col('price')), 'avgPrice'],
      [sequelize.fn('MIN', sequelize.col('price')), 'minPrice'],
      [sequelize.fn('MAX', sequelize.col('price')), 'maxPrice']
    ],
    group: ['category'],
    raw: true
  });
};

// Instance Methods

/**
 * Check if product needs restocking (less than 10 items)
 * @returns {boolean} True if needs restocking
 */
Product.prototype.needsRestocking = function() {
  return this.stockQuantity < 10;
};

/**
 * Add stock
 * @param {number} quantity - Quantity to add
 * @returns {Promise} Updated product
 */
Product.prototype.addStock = async function(quantity) {
  if (quantity <= 0) {
    throw new Error('Quantity must be positive');
  }
  this.stockQuantity += quantity;
  return await this.save();
};

/**
 * Remove stock
 * @param {number} quantity - Quantity to remove
 * @returns {Promise} Updated product
 */
Product.prototype.removeStock = async function(quantity) {
  if (quantity <= 0) {
    throw new Error('Quantity must be positive');
  }
  if (this.stockQuantity < quantity) {
    throw new Error('Insufficient stock');
  }
  this.stockQuantity -= quantity;
  return await this.save();
};

/**
 * Update price
 * @param {number} newPrice - New price
 * @returns {Promise} Updated product
 */
Product.prototype.updatePrice = async function(newPrice) {
  if (newPrice < 0) {
    throw new Error('Price cannot be negative');
  }
  this.price = newPrice;
  return await this.save();
};

/**
 * Get product value (price * stock)
 * @returns {number} Total value
 */
Product.prototype.getTotalValue = function() {
  return parseFloat(this.price) * this.stockQuantity;
};

export default Product;
// Import DataTypes from Sequelize
// DataTypes define what type of data each column can hold
import { DataTypes } from 'sequelize';

// Import sequelize instance
import sequelize from '../config/database.js';

// Define User model as a class
// This represents the 'users' table in database
const User = sequelize.define('User', {
  // Define model attributes (columns)
  
  // id - Primary key (auto-generated)
  id: {
    type: DataTypes.INTEGER,     // Integer type
    primaryKey: true,            // This is the primary key
    autoIncrement: true          // Auto-increment (1, 2, 3, ...)
  },
  
  // name - User's full name
  name: {
    type: DataTypes.STRING(100), // String with max length 100
    allowNull: false,            // Cannot be null (required field)
    validate: {
      notEmpty: true             // Cannot be empty string
    }
  },
  
  // email - Must be unique
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,                // No two users can have same email
    validate: {
      isEmail: true,             // Must be valid email format
      notEmpty: true
    }
  },
  
  // age - Optional integer
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,             // Optional field
    validate: {
      min: 1,                    // Must be at least 1
      max: 150                   // Must be at most 150
    }
  },
  
  // city - Optional string
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  // country - Optional string
  country: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  // signupDate - Date user signed up
  signupDate: {
    type: DataTypes.DATEONLY,    // Date without time (YYYY-MM-DD)
    allowNull: false,
    defaultValue: DataTypes.NOW  // Defaults to current date
  },
  
  // subscriptionTier - Type of subscription
  subscriptionTier: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isIn: [['free', 'basic', 'premium', 'enterprise']]  // Must be one of these values
    }
  }
}, {
  // Model options
  tableName: 'users',            // Explicit table name
  timestamps: true,              // Adds createdAt and updatedAt
  indexes: [
    {
      fields: ['email']          // Create index on email for faster queries
    },
    {
      fields: ['country']        // Create index on country
    }
  ]
});

// Class methods - belong to the model itself
// These are like static methods in traditional OOP

/**
 * Find all users
 * @returns {Promise} Array of all users
 */
User.findAllUsers = async function() {
  return await this.findAll({
    order: [['createdAt', 'DESC']]  // Sort by newest first
  });
};

/**
 * Find users by country
 * @param {string} country - Country name
 * @returns {Promise} Array of users from that country
 */
User.findByCountry = async function(country) {
  return await this.findAll({
    where: { country }           // WHERE country = ?
  });
};

/**
 * Find users by subscription tier
 * @param {string} tier - Subscription tier
 * @returns {Promise} Array of users with that tier
 */
User.findByTier = async function(tier) {
  return await this.findAll({
    where: { subscriptionTier: tier }
  });
};

/**
 * Get user statistics by country
 * @returns {Promise} Array of {country, count}
 */
User.getCountryStats = async function() {
  return await this.findAll({
    attributes: [
      'country',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']  // SQL: COUNT(id)
    ],
    group: ['country'],          // GROUP BY country
    raw: true                    // Return plain objects instead of Sequelize instances
  });
};

// Instance methods - belong to individual user instances
// These are like regular methods in traditional OOP

/**
 * Get full user information as JSON
 * @returns {Object} User data
 */
User.prototype.getFullInfo = function() {
  return {
    id: this.id,
    name: this.name,
    email: this.email,
    age: this.age,
    location: `${this.city}, ${this.country}`,
    subscriptionTier: this.subscriptionTier,
    memberSince: this.signupDate
  };
};

/**
 * Check if user is premium
 * @returns {boolean} True if premium or enterprise
 */
User.prototype.isPremium = function() {
  return ['premium', 'enterprise'].includes(this.subscriptionTier);
};

/**
 * Update subscription tier
 * @param {string} newTier - New tier
 * @returns {Promise} Updated user
 */
User.prototype.updateTier = async function(newTier) {
  this.subscriptionTier = newTier;
  return await this.save();
};

// Export the model
export default User;
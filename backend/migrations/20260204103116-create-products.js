export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('products', {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING(200),
      allowNull: false
    },
    category: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    stock_quantity: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    rating: {
      type: Sequelize.DECIMAL(3, 2),
      defaultValue: 0
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false
    }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('products');
}

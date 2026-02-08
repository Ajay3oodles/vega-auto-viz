export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('order_items', {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    order_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    product_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    subtotal: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
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
  await queryInterface.dropTable('order_items');
}

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('users', {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    },
    country: {
      type: Sequelize.STRING(100)
    },
    subscription_tier: {
      type: Sequelize.STRING(50),
      defaultValue: 'free'
    },
    signup_date: {
      type: Sequelize.DATEONLY,
      defaultValue: Sequelize.NOW
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
  await queryInterface.dropTable('users');
}

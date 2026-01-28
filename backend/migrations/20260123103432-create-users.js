export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('users', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
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
    age: {
      type: Sequelize.INTEGER
    },
    city: {
      type: Sequelize.STRING(100)
    },
    country: {
      type: Sequelize.STRING(100)
    },
    sign_up_date: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    subscription_tier: {
      type: Sequelize.STRING(50)
    },
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('users');
}

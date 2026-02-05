// migrations/202602040001-create-widgets.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('widgets', {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },

    user_id: {
      type: Sequelize.UUID,
      allowNull: false
    },

    name: {
      type: Sequelize.STRING(150),
      allowNull: false
    },

    prompt: {
      type: Sequelize.TEXT,
      allowNull: false
    },

    sql_query: {
      type: Sequelize.TEXT,
      allowNull: false
    },

    vega_spec: {
      type: Sequelize.JSONB,
      allowNull: false
    },

    analysis: {
      type: Sequelize.JSONB,
      allowNull: false
    },

    is_last_widget: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },

    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()')
    },

    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()')
    }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('widgets');
}

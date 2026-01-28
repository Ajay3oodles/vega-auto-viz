'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('widgets', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      primaryKey: true
    },

    name: {
      type: Sequelize.STRING
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
      type: Sequelize.JSONB
    },

    created_by: {
      type: Sequelize.UUID
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

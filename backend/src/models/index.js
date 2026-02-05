import sequelize from '../config/database.js';

import UserModel from './User.js';
import ProductModel from './Product.js';
import OrderModel from './Order.js';
import OrderItemModel from './OrderItem.js';
import WidgetModel from './Widget.js';

import applyAssociations from './Associations.js';

const models = {
  User: UserModel(sequelize),
  Product: ProductModel(sequelize),
  Order: OrderModel(sequelize),
  OrderItem: OrderItemModel(sequelize),
  Widget: WidgetModel(sequelize)
};

applyAssociations(models);

export { sequelize };
export default models;

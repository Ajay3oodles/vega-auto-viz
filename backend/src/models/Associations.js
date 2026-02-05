export default function applyAssociations(models) {
  const { User, Order, Product, OrderItem, Widget } = models;

  // User → Orders
  User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
  Order.belongsTo(User, { foreignKey: 'user_id', as: 'customer' });

  // Order ↔ Product (Many-to-Many via OrderItem)
  Order.belongsToMany(Product, {
    through: OrderItem,
    foreignKey: 'order_id',
    otherKey: 'product_id',
    as: 'products'
  });

  Product.belongsToMany(Order, {
    through: OrderItem,
    foreignKey: 'product_id',
    otherKey: 'order_id',
    as: 'orders'
  });

  // User → Widgets
  User.hasMany(Widget, { foreignKey: 'created_by', as: 'widgets' });
  Widget.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
}

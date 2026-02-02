module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    duration_in_days: { type: DataTypes.INTEGER, allowNull: false }, // e.g., 30 for monthly plans
    features: { type: DataTypes.JSON }, // Optional: store plan-specific features
  }, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  });

  return Subscription;
};
const Order = require("../models/oder.model");

const checkIfUserPurchasedProduct = async (userId, productId) => {
  const orders = await Order.findOne({
    userId,
    status: "completed",
    "products.productId": productId,
  });
  return !!orders;
};

module.exports = {
  checkIfUserPurchasedProduct,
};

/* eslint-disable */
const Order = require("../models/order.model");
const mongoose = require("mongoose");
const checkIfUserPurchasedProduct = async (userId, productId) => {
  const orders = await Order.find({
    userId,
    status: "completed",
    "products.productId": productId,
  });
  return !!orders;
};

const createOrder = async (userId, orderData) => {
  const order = new Order({
    userId,
    ...orderData,
  });
  await order.save();
  return order;
};

const getOrdersByUser = async (userId, status) => {
  const uId = new mongoose.Types.ObjectId(userId);
  console.log("🚀 ~ getOrdersByUser ~ uId:", uId);
  const orders = await Order.find({ userId: uId, status })
    .populate("products.productId", "image")
    .populate("userId", "name phone")
    .sort({ createdAt: -1 })
    .lean();
  console.log("🚀 ~ getOrdersByUser ~ orders:", orders);

  const formatted = orders.map((order) => ({
    orderId: order._id,
    createdAt: order.createdAt,
    status: order.status,
    totalItems: (order.products || []).reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    ),
    totalAmount: order.totalAmount,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.payment?.method || "cash",
    products: (order.products || []).map((item) => {
      const prod = item.productId || null; // may be null if deleted or unpopulated
      return {
        _id: prod?._id || item.productId || null, // fallback to stored ref (could be ObjectId/string)
        image: prod?.image || null,
        name: item.name, // snapshot
        quantity: item.quantity || 0, // snapshot
        unitPrice: item.price || 0, // snapshot
        customization: item.customization || null,
        toppings: (item.toppings || []).map((t) => ({
          name: t.name,
          price: t.price,
        })),
      };
    }),
  }));
  return formatted;
};
const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate("userId", "name email phone")
    .populate("products.productId", "image")
    .lean();
  const formattedProducts = (order?.products || []).map((p) => {
    const prod = p.productId || null;
    return {
      _id: prod?._id || p.productId || null,
      image: prod?.image || null,
      name: p.name,
      quantity: p.quantity || 0,
      unitPrice: p.price || 0,
      toppings: (p.toppings || []).map((t) => ({
        name: t.name,
        price: t.price,
      })),
    };
  });
  return { ...(order || {}), products: formattedProducts };
};

const updateOrderStatus = async (orderId, status) => {
  const updatedOrder = await Order.findByIdAndUpdate(orderId, { status });
  return updatedOrder;
};

module.exports = {
  checkIfUserPurchasedProduct,
  createOrder,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
};

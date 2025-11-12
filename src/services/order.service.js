const mongoose = require("mongoose");
const Order = require("../models/order.model");

const toObjectId = (id) => {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id))
    return new mongoose.Types.ObjectId(id);
  return null;
};

const checkIfUserPurchasedProduct = async (userId, productId) => {
  // trả về false nếu userId không hợp lệ
  const uId = toObjectId(userId);
  if (!uId) return false;

  // nếu productId có thể là string hoặc ObjectId
  const pId = mongoose.Types.ObjectId.isValid(productId)
    ? new mongoose.Types.ObjectId(productId)
    : productId;

  const orders = await Order.findOne({
    userId: uId,
    status: "completed",
    "products.productId": pId,
  }).lean();

  return !!orders;
};

const createOrder = async (userId, orderData) => {
  const uId = toObjectId(userId);
  if (!uId) throw new Error("Invalid userId");

  const order = new Order({
    userId: uId,
    ...orderData,
  });
  await order.save();
  return order;
};

const getOrdersByUser = async (userId, status) => {
  const uId = toObjectId(userId);
  if (!uId) return []; // hoặc throw nếu bạn muốn báo lỗi

  const filter = { userId: uId };
  if (typeof status !== "undefined" && status !== null && status !== "") {
    filter.status = status;
  }

  const orders = await Order.find(filter)
    .populate("products.productId", "image")
    .populate("userId", "name phone")
    .sort({ createdAt: -1 })
    .lean();

  const formatted = (orders || []).map((order) => ({
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
    products: (order.products || []).map((item) => ({
      _id: item.productId?._id || item.productId, // nếu đã bị xoá product hoặc không populate
      image: item.productId?.image || null,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      customization: item.customization || null,
      toppings: (item.toppings || []).map((t) => ({
        name: t.name,
        price: t.price,
      })),
    })),
  }));
  return formatted;
};

const getOrderById = async (orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) return null;
  const order = await Order.findById(orderId)
    .populate("userId", "name email phone")
    .populate("products.productId", "image")
    .lean();

  if (!order) return null;

  const formattedProducts = (order.products || []).map((p) => ({
    _id: p.productId?._id || p.productId,
    image: p.productId?.image || null,
    name: p.name,
    quantity: p.quantity,
    unitPrice: p.price,
    toppings: (p.toppings || []).map((t) => ({ name: t.name, price: t.price })),
  }));
  return { ...order, products: formattedProducts };
};

const updateOrderStatus = async (orderId, status) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) return null;
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true, runValidators: true }
  ).lean();
  return updatedOrder;
};

module.exports = {
  checkIfUserPurchasedProduct,
  createOrder,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
};

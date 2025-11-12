/* eslint-disable prettier/prettier */
const Order = require("../models/order.model");
const OrderStatusLog = require("../models/orderStaff.model");

/**
 * Lấy danh sách tất cả đơn hàng (có thể filter theo status)
 * @param {Object} filter
 * @returns {Promise<Order[]>}
 */
const getOrders = async (filter = {}) => {
  const query = {};
  if (filter.status) query.status = filter.status;
  if (filter.userId) query.userId = filter.userId;

  if (filter.search) {
    const searchRegex = { $regex: filter.search, $options: "i" };
    const searchConditions = [];

    // Search theo địa chỉ giao hàng
    searchConditions.push({ shippingAddress: searchRegex });

    // Search theo tổng tiền (chính xác)
    // eslint-disable-next-line no-restricted-globals
    if (!isNaN(filter.search)) {
      const amount = parseFloat(filter.search);
      searchConditions.push({ totalAmount: amount });
    }

    query.$or = searchConditions;
  }

  return Order.find(query)
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
};

/**
 * Lấy chi tiết 1 order
 * @param {ObjectId} orderId
 * @returns {Promise<Order>}
 */
const getOrderById = async (orderId) => {
  return Order.findById(orderId).populate("userId", "name email");
};

/**
 * Cập nhật trạng thái đơn hàng và ghi log
 * @param {ObjectId} orderId
 * @param {String} newStatus
 * @param {ObjectId} changedBy
 * @param {String} note
 * @returns {Promise<Order>}
 */
const updateOrderStatus = async (orderId, newStatus, changedBy, note = "") => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Không tìm thấy đơn hàng");

  // 🚫 Kiểm tra trạng thái hiện tại
  if (order.status === "completed") {
    throw new Error("Đơn hàng đã hoàn tất, không thể thay đổi trạng thái.");
  }

  if (order.status === "cancelled") {
    throw new Error("Đơn hàng đã bị hủy, không thể thay đổi trạng thái.");
  }

  const previousStatus = order.status;

  // Cập nhật trạng thái mới
  order.status = newStatus;
  await order.save();

  // Ghi log thay đổi
  await OrderStatusLog.create({
    orderId,
    previousStatus,
    newStatus,
    changedBy,
    note,
  });

  return order;
};

/**
 * Lấy lịch sử thay đổi trạng thái của đơn hàng
 * @param {ObjectId} orderId
 * @returns {Promise<OrderStatusLog[]>}
 */
const getOrderLogs = async (orderId) => {
  return OrderStatusLog.find({ orderId })
    .sort({ changedAt: -1 })
    .populate("changedBy", "name email");
};

/**
 * Xóa log (nếu cần dọn dẹp)
 * @param {ObjectId} logId
 * @returns {Promise<OrderStatusLog>}
 */
const deleteOrderLog = async (logId) => {
  const log = await OrderStatusLog.findById(logId);
  if (!log) throw new Error("Không tìm thấy log");
  await log.remove();
  return log;
};

/**
 * Xóa đơn hàng
 * @param {ObjectId} orderId
 * @returns {Promise<Order>}
 */
const deleteOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Không tìm thấy đơn hàng");
  await order.remove();
  return order;
};

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderLogs,
  deleteOrderLog,
  deleteOrder,
};

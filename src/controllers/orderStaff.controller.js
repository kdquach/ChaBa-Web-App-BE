/* eslint-disable prefer-destructuring */
/* eslint-disable prettier/prettier */
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const orderStaffService = require("../services/orderStaff.service");

/**
 * [GET] /orders
 * Lấy danh sách đơn hàng (có thể filter theo status)
 */
const getOrders = catchAsync(async (req, res) => {
  const filter = {
    status: req.query.status,
    userId: req.query.userId,
    search: req.query.search,
  };
  const orders = await orderStaffService.getOrders(filter);
  res.status(httpStatus.OK).send(orders);
});

/**
 * [GET] /orders/:orderId
 * Lấy chi tiết đơn hàng
 */
const getOrderById = catchAsync(async (req, res) => {
  const order = await orderStaffService.getOrderById(req.params.orderId);
  if (!order) {
    return res
      .status(httpStatus.NOT_FOUND)
      .send({ message: "Không tìm thấy đơn hàng" });
  }
  res.status(httpStatus.OK).send(order);
});

/**
 * [PATCH] /orders/:orderId/status
 * Cập nhật trạng thái đơn hàng và ghi log
 */
const updateOrderStatus = catchAsync(async (req, res) => {
  const { newStatus, note } = req.body;
  const orderId = req.params.orderId;
  const userId = req.user?.id || null; // lấy từ token

  if (!newStatus) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ message: "Thiếu trường newStatus" });
  }

  try {
    const updatedOrder = await orderStaffService.updateOrderStatus(
      orderId,
      newStatus,
      userId,
      note
    );
    res.status(httpStatus.OK).send(updatedOrder);
  } catch (error) {
    // ✅ Trả về 400 cho lỗi logic (ví dụ đã completed hoặc cancelled)
    if (
      error.message.includes("hoàn tất") ||
      error.message.includes("bị hủy")
    ) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .send({ message: error.message });
    }

    // Các lỗi khác (ví dụ lỗi DB) giữ nguyên 500
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: error.message });
  }
});

/**
 * [GET] /orders/:orderId/logs
 * Lấy lịch sử thay đổi trạng thái của đơn hàng
 */
const getOrderLogs = catchAsync(async (req, res) => {
  const logs = await orderStaffService.getOrderLogs(req.params.orderId);
  res.status(httpStatus.OK).send(logs);
});

/**
 * [DELETE] /order-logs/:logId
 * Xóa 1 log (nếu cần)
 */
const deleteOrderLog = catchAsync(async (req, res) => {
  await orderStaffService.deleteOrderLog(req.params.logId);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * [DELETE] /orders/:orderId
 * Xóa đơn hàng
 */
const deleteOrder = catchAsync(async (req, res) => {
  await orderStaffService.deleteOrder(req.params.orderId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderLogs,
  deleteOrderLog,
  deleteOrder,
};

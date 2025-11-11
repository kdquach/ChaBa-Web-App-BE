/* eslint-disable prettier/prettier */
const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const orderStaffValidation = require("../../validations/orderStaff.validation");
const orderStaffController = require("../../controllers/orderStaff.controller");

const router = express.Router();

// Lấy danh sách đơn hàng
router
  .route("/")
  .get(
    auth("getOrders"),
    validate(orderStaffValidation.getOrders),
    orderStaffController.getOrders
  );

// Lấy chi tiết 1 đơn hàng
router
  .route("/:orderId")
  .get(
    auth("getOrders"),
    validate(orderStaffValidation.getOrderById),
    orderStaffController.getOrderById
  )
  .delete(
    auth("manageOrders"),
    validate(orderStaffValidation.getOrderById),
    orderStaffController.deleteOrder
  );

// Cập nhật trạng thái đơn hàng + ghi log
router
  .route("/:orderId/status")
  .patch(
    auth("manageOrders"),
    validate(orderStaffValidation.updateOrderStatus),
    orderStaffController.updateOrderStatus
  );

// Lấy lịch sử thay đổi trạng thái của 1 đơn hàng
router
  .route("/:orderId/logs")
  .get(
    auth("getOrders"),
    validate(orderStaffValidation.getOrderLogs),
    orderStaffController.getOrderLogs
  );

// Xóa log (tùy chọn)
router
  .route("/order-logs/:logId")
  .delete(
    auth("manageOrders"),
    validate(orderStaffValidation.deleteOrderLog),
    orderStaffController.deleteOrderLog
  );

module.exports = router;

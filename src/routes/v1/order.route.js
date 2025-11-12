
const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/order.controller");
const orderValidation = require("../../validations/order.validation");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");

// Use real JWT auth for all user-facing order endpoints
router.post("/", auth(), validate(orderValidation.createOrder), orderController.createOrder); // Tạo đơn hàng
router.get("/", auth(), orderController.getUserOrdersByStatus); // Lấy danh sách đơn hàng của user
router.get("/:orderId", auth('getOrders'), validate(orderValidation.getOrderById), orderController.getOrderById); // Chi tiết đơn hàng
router.get('/:orderId/logs', auth(), orderController.getOrderLogs); // Lịch sử thay đổi trạng thái
router.patch('/:orderId/:status', auth(), validate(orderValidation.updateOrderStatus), orderController.updateOrderStatus); // Cập nhật trạng thái / hủy đơn hàng
module.exports = router;

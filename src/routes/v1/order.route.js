
const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/order.controller");
const orderValidation = require("../../validations/order.validation");
const mockAuth = require("../../middlewares/mockupAuth");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");

router.post("/", mockAuth('user'), validate(orderValidation.createOrder), orderController.createOrder); // Tạo đơn hàng
router.get("/", mockAuth('user'), orderController.getUserOrdersByStatus); // Lấy danh sách đơn hàng của user
router.get("/:orderId", auth('getOrders'), validate(orderValidation.getOrderById), orderController.getOrderById); // Chi tiết đơn hàng


module.exports = router;

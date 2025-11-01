

const orderService = require("../services/order.service");
const catchAsync = require("../utils/catchAsync");

const createOrder = catchAsync(async (req, res) => {
    const userId = req.user.id; // từ middleware auth
    console.log("🚀 ~ userId:", userId)
    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const orderData = req.body;

    const order = await orderService.createOrder(userId, orderData);
    res.status(201).json({
        success: true,
        message: "Tạo đơn hàng thành công",
        data: order,
    });
});

const getUserOrdersByStatus = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { status } = req.query
    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const orders = await orderService.getOrdersByUser(userId, status);
    res.json({ success: true, data: orders });
});

const getOrderById = catchAsync(async (req, res) => {
    const orderId = req.params.orderId;
    if (!orderId) {
        return res.status(400).json({ success: false, message: "Order ID is required" });
    }
    const order = await orderService.getOrderById(orderId);
    res.json({ success: true, data: order });
});

const updateOrderStatus = catchAsync(async (req, res) => {
    const { orderId, status } = req.params;
    if (!orderId || !status) {
        return res.status(400).json({ success: false, message: "Order ID and status are required" });
    }
    const result = await orderService.updateOrderStatus(orderId, status);
    if (!result) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Cập nhật trạng thái đơn hàng thành công" });
})

module.exports = {
    createOrder,
    getUserOrdersByStatus,
    getOrderById,
    updateOrderStatus,
}
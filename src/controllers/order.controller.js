

const orderService = require("../services/order.service");
const orderStaffService = require("../services/orderStaff.service");
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
        getOrderLogs,
}

// Return order status change logs for a given order (only owner or staff/admin can view)
async function getOrderLogs(req, res) {
    const { orderId } = req.params;
    if (!orderId) {
        return res.status(400).json({ success: false, message: "Order ID is required" });
    }
    const order = await orderService.getOrderById(orderId);
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }
    const isOwner = String(order.userId?._id || order.userId) === String(req.user.id);
    const role = req.user.role;
    const isStaff = role === 'admin' || role === 'staff';
    if (!isOwner && !isStaff) {
        return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const logs = await orderStaffService.getOrderLogs(orderId);
    // Return ascending by time for UI simplicity
    const normalized = (logs || [])
        .map(l => ({
            previousStatus: l.previousStatus,
            newStatus: l.newStatus,
            note: l.note,
            changedAt: l.changedAt || l.createdAt,
            changedBy: l.changedBy,
        }))
        .sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));
    return res.json({ success: true, data: normalized });
}
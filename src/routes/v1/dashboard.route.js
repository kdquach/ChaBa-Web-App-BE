const express = require("express");
const auth = require("../../middlewares/auth");
const dashboardController = require("../../controllers/dashboard.controller");

const router = express.Router();

// Protect all dashboard routes (adjust role logic as needed)
router.use(auth());

router.get("/overview", dashboardController.overview);
router.get("/revenue-series", dashboardController.revenueSeries);
router.get("/top-products", dashboardController.topProducts);
router.get("/recent-orders", dashboardController.recentOrders);

module.exports = router;
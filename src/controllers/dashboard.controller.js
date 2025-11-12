const httpStatus = require("http-status");
const dashboardService = require("../services/dashboard.service");

class DashboardController {
  async overview(req, res, next) {
    try {
      const data = await dashboardService.getOverview();
      res.status(httpStatus.OK).json({ data });
    } catch (err) {
      next(err);
    }
  }

  async revenueSeries(req, res, next) {
    try {
      const { from, to, groupBy } = req.query;
      const data = await dashboardService.getRevenueSeries({ from, to, groupBy });
      res.status(httpStatus.OK).json({ data });
    } catch (err) {
      next(err);
    }
  }

  async topProducts(req, res, next) {
    try {
      const { from, to, limit } = req.query;
      const data = await dashboardService.getTopProducts({ from, to, limit: Number(limit) || 5 });
      res.status(httpStatus.OK).json({ data });
    } catch (err) {
      next(err);
    }
  }

  async recentOrders(req, res, next) {
    try {
      const { limit } = req.query;
      const data = await dashboardService.getRecentOrders({ limit: Number(limit) || 5 });
      res.status(httpStatus.OK).json({ data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();
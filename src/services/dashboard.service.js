/* Dashboard aggregation service */
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const dayjs = require("dayjs");

class DashboardService {
  async getOverview() {
    // Orders status counts
    const orderStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ];
    const statusCounts = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const statusMap = Object.fromEntries(
      statusCounts.map((s) => [s._id, s.count])
    );
    const totalOrders = statusCounts.reduce((a, c) => a + c.count, 0);

    // Revenue summaries (completed only)
    const revenueAgg = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // Users split
    const totalUsers = await User.countDocuments();
    const staffCount = await User.countDocuments({ type: "staff" });
    const customerCount = await User.countDocuments({ type: "user" });

    // Products
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: "Đang bán" });

    const processingCount = (statusMap.confirmed || 0) + (statusMap.preparing || 0) + (statusMap.ready || 0);
    // Trend comparison: current 7 days vs previous 7 days
    const today = dayjs().endOf('day');
    const currentFrom = today.subtract(6, 'day').startOf('day');
    const prevFrom = currentFrom.subtract(7, 'day');
    const prevTo = currentFrom.subtract(1, 'day').endOf('day');

    const completedCurrent = await Order.countDocuments({ status: 'completed', createdAt: { $gte: currentFrom.toDate(), $lte: today.toDate() } });
    const completedPrev = await Order.countDocuments({ status: 'completed', createdAt: { $gte: prevFrom.toDate(), $lte: prevTo.toDate() } });
    const revenueCurrentAgg = await Order.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: currentFrom.toDate(), $lte: today.toDate() } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const revenuePrevAgg = await Order.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: prevFrom.toDate(), $lte: prevTo.toDate() } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const revenueCurrent = revenueCurrentAgg[0]?.totalRevenue || 0;
    const revenuePrev = revenuePrevAgg[0]?.totalRevenue || 0;

    const customersCurrent = await User.countDocuments({ type: 'user', createdAt: { $gte: currentFrom.toDate(), $lte: today.toDate() } });
    const customersPrev = await User.countDocuments({ type: 'user', createdAt: { $gte: prevFrom.toDate(), $lte: prevTo.toDate() } });

    const pctChange = (curr, prev) => {
      if (!prev && !curr) return 0;
      if (!prev) return 100; // from 0 to something
      return Math.round(((curr - prev) / prev) * 1000) / 10; // one decimal
    };

    // Daily series (last 7 days) for sparkline
    // Build date keys array ascending
    const days = [];
    for (let d = currentFrom.clone(); d.isBefore(today) || d.isSame(today, 'day'); d = d.add(1, 'day')) {
      days.push(d.startOf('day'));
    }

    // Completed orders per day
    const completedDailyAgg = await Order.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: currentFrom.toDate(), $lte: today.toDate() } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    ]);
    const completedDailyMap = Object.fromEntries(completedDailyAgg.map(r => [r._id, r]));

    // New customers per day
    const customersDailyAgg = await User.aggregate([
      { $match: { type: 'user', createdAt: { $gte: currentFrom.toDate(), $lte: today.toDate() } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]);
    const customersDailyMap = Object.fromEntries(customersDailyAgg.map(r => [r._id, r]));

    const dailyCompleted = days.map(d => {
      const key = d.format('YYYY-MM-DD');
      return { date: key, value: completedDailyMap[key]?.count || 0 };
    });
    const dailyRevenue = days.map(d => {
      const key = d.format('YYYY-MM-DD');
      return { date: key, revenue: completedDailyMap[key]?.revenue || 0, orders: completedDailyMap[key]?.count || 0 };
    });
    const dailyCustomers = days.map(d => {
      const key = d.format('YYYY-MM-DD');
      return { date: key, value: customersDailyMap[key]?.count || 0 };
    });

    return {
      orders: {
        total: totalOrders,
        processing: processingCount,
        ...orderStatuses.reduce(
          (acc, st) => ({ ...acc, [st]: statusMap[st] || 0 }),
          {}
        ),
        trend: {
          range: { from: currentFrom.toISOString(), to: today.toISOString(), prevFrom: prevFrom.toISOString(), prevTo: prevTo.toISOString() },
          completed: {
            current: completedCurrent,
            previous: completedPrev,
            changePct: pctChange(completedCurrent, completedPrev),
          },
        },
        dailyCompleted,
      },
      revenue: {
        totalRevenue,
        trend: {
          current: revenueCurrent,
          previous: revenuePrev,
          changePct: pctChange(revenueCurrent, revenuePrev),
        },
        daily: dailyRevenue,
      },
      users: {
        total: totalUsers,
        staff: staffCount,
        customer: customerCount,
        trend: {
          customer: {
            current: customersCurrent,
            previous: customersPrev,
            changePct: pctChange(customersCurrent, customersPrev),
          },
        },
        dailyCustomers,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
      },
    };
  }

  async getRevenueSeries({ from, to, groupBy = "day" }) {
    const start = from ? dayjs(from).startOf("day") : dayjs().subtract(29, "day");
    const end = to ? dayjs(to).endOf("day") : dayjs();

    const match = {
      status: "completed",
      createdAt: { $gte: start.toDate(), $lte: end.toDate() },
    };

    let dateFormat;
    if (groupBy === "year") dateFormat = { $dateToString: { format: "%Y", date: "$createdAt" } };
    else if (groupBy === "month") dateFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    else dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }; // day

    const buckets = await Order.aggregate([
      { $match: match },
      { $group: { _id: dateFormat, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const totalRevenue = buckets.reduce((s, b) => s + b.revenue, 0);
    const totalOrders = buckets.reduce((s, b) => s + b.orders, 0);

    return {
      from: start.toISOString(),
      to: end.toISOString(),
      groupBy,
      totalRevenue,
      totalOrders,
      avgOrderValue: totalOrders ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
      buckets: buckets.map((b) => ({ key: b._id, revenue: b.revenue, orders: b.orders })),
    };
  }

  async getTopProducts({ from, to, limit = 5 }) {
    const start = from ? dayjs(from).startOf("day") : dayjs().subtract(30, "day");
    const end = to ? dayjs(to).endOf("day") : dayjs();

    const rows = await Order.aggregate([
      { $match: { status: "completed", createdAt: { $gte: start.toDate(), $lte: end.toDate() } } },
      { $unwind: "$products" },
      {
        $group: {
          _id: { id: "$products.productId", name: "$products.name" },
          quantity: { $sum: "$products.quantity" },
          revenue: { $sum: { $multiply: ["$products.quantity", "$products.price"] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: limit },
    ]);
    const totalQty = rows.reduce((s, r) => s + r.quantity, 0) || 1;
    return rows.map((r) => ({
      type: r._id.name,
      value: r.quantity,
      percent: r.quantity / totalQty,
      revenue: r.revenue,
    }));
  }

  async getRecentOrders({ limit = 5 }) {
    const rows = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({ path: 'userId', select: 'name' })
      .select('userId totalAmount status createdAt')
      .lean();
    return rows.map((o) => ({
      id: o._id,
      orderNumber: String(o._id).slice(-6).toUpperCase(),
      customer: o.userId?.name || 'Khách',
      total: o.totalAmount || 0,
      status: o.status,
      createdAt: o.createdAt,
    }));
  }
}

module.exports = new DashboardService();
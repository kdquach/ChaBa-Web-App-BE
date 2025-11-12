const express = require("express");
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const addressesRoute = require("./address.route");
const productRoute = require("./product.route");
const categoryRoute = require("./category.route");
const ingredientRoute = require("./ingredient.route");
const ingredientCategoryRoute = require("./ingredientCategory.route");
const cartRoute = require("./cart.route");
const toppingRoute = require("./topping.route");
const feedbackRoute = require("./feedback.route");
const dashboardRoute = require("./dashboard.route");
const docsRoute = require("./docs.route");
const orderRoute = require("./order.route");
const orderStaffRoute = require("./orderStaff.route");
const config = require("../../config/config");

// const { path } = require("../../app");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/addresses",
    route: addressesRoute,
  },
  {
    path: "/products",
    route: productRoute,
  },
  {
    path: "/categories",
    route: categoryRoute,
  },
  {
    path: "/ingredients",
    route: ingredientRoute,
  },
  {
    path: "/ingredient-categories",
    route: ingredientCategoryRoute,
  },
  {
    path: "/toppings",
    route: toppingRoute,
  },
  {
    path: "/feedbacks",
    route: feedbackRoute,
  },
  {
    path: "/dashboard",
    route: dashboardRoute,
  },
  {
    path: "/cart",
    route: cartRoute,
  },
  {
    path: "/orders",
    route: orderRoute,
  },
  {
    path: "/order-staff",
    route: orderStaffRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: "/docs",
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;

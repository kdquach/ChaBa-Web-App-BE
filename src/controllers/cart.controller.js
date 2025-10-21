/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { cartService } = require("../services");

/**
 * Thêm sản phẩm vào giỏ hàng
 */
const addToCart = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const cart = await cartService.addToCart(userId, req.body);
  res.status(httpStatus.CREATED).send(cart);
});
/**
 * Lấy giỏ hàng của người dùng
 */
const getCart = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const cart = await cartService.getCartByUserId(userId);
  res.status(httpStatus.OK).send(cart);
});

/**
 * Cập nhật số lượng hoặc tùy chỉnh sản phẩm trong giỏ
 */
const updateCartItem = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.params;
  const cart = await cartService.updateCartItem(userId, itemId, req.body);
  res.status(httpStatus.OK).send(cart);
});

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
const removeCartItem = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.params;
  const cart = await cartService.removeCartItem(userId, itemId);
  res.status(httpStatus.OK).send(cart);
});

/**
 * Xóa toàn bộ giỏ hàng
 */
const clearCart = catchAsync(async (req, res) => {
  const userId = req.user.id;
  // const userId = req.user?.id || req.user?._id || "68df7d118f96b6b6c18b0142"; // gán ID test
  await cartService.clearCart(userId);
  res.status(httpStatus.OK).send({ message: "Giỏ hàng đã được xóa" });
});

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};

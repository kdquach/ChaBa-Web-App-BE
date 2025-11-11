/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { cartService } = require("../services");

/**
 * 🛒 Thêm sản phẩm vào giỏ hàng
 */
const addToCart = catchAsync(async (req, res) => {
  const userId = req.user?.id || req.user?._id;
  if (!userId)
    return res
      .status(httpStatus.UNAUTHORIZED)
      .send({ message: "Không xác định được người dùng" });

  const cart = await cartService.addToCart(userId, req.body);
  res.status(httpStatus.CREATED).send(cart);
});

/**
 * 📦 Lấy giỏ hàng của người dùng
 */
const getCart = catchAsync(async (req, res) => {
  const userId = req.user?.id || req.user?._id;
  if (!userId)
    return res
      .status(httpStatus.UNAUTHORIZED)
      .send({ message: "Không xác định được người dùng" });

  const cart = await cartService.getCartByUserId(userId);
  res.status(httpStatus.OK).send(cart);
});

/**
 * ✏️ Cập nhật item trong giỏ hàng
 */
const updateCartItem = catchAsync(async (req, res) => {
  const userId = req.user?.id || req.user?._id;
  const { itemId } = req.params;
  const cart = await cartService.updateCartItem(userId, itemId, req.body);
  res.status(httpStatus.OK).send(cart);
});

/**
 * ❌ Xóa 1 sản phẩm trong giỏ hàng
 */
const removeCartItem = catchAsync(async (req, res) => {
  const userId = req.user?.id || req.user?._id;
  const { itemId } = req.params;
  const cart = await cartService.removeCartItem(userId, itemId);
  res.status(httpStatus.OK).send(cart);
});

/**
 * 🧹 Xóa toàn bộ giỏ hàng
 */
const clearCart = catchAsync(async (req, res) => {
  const userId = req.user?.id || req.user?._id;
  await cartService.clearCart(userId);
  res.status(httpStatus.OK).send({ message: "Đã xóa toàn bộ giỏ hàng" });
});

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};

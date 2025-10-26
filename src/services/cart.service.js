// /* eslint-disable no-await-in-loop */
// /* eslint-disable no-restricted-syntax */
// const httpStatus = require("http-status");
// const ApiError = require("../utils/ApiError");
// const Cart = require("../models/cart.model");
// const Product = require("../models/product.model");
// const Topping = require("../models/topping.model");
// const User = require("../models/user.model");

// /**
//  * 🧩 Hàm so sánh topping giữa hai mảng
//  */
// const isSameToppings = (a = [], b = []) => {
//   if (a.length !== b.length) return false;
//   return a.every(
//     (t, i) =>
//       t.toppingId.toString() === b[i].toppingId.toString() &&
//       t.quantity === b[i].quantity
//   );
// };

// /**
//  * 🧩 Hàm so sánh customization giữa hai object
//  */
// const isSameCustomization = (a = {}, b = {}) => {
//   return (
//     (a.ice || 0) === (b.ice || 0) &&
//     (a.sugar || 0) === (b.sugar || 0) &&
//     (a.description || "") === (b.description || "")
//   );
// };

// /**
//  * 🛒 Thêm sản phẩm vào giỏ hàng
//  */
// const addToCart = async (userId, cartBody) => {
//   const {
//     productId,
//     quantity = 1,
//     customization = {},
//     toppings = [],
//     note = "",
//   } = cartBody;

//   // Kiểm tra user và product tồn tại
//   const user = await User.findById(userId);
//   if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

//   const product = await Product.findById(productId);
//   if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");

//   // Kiểm tra topping hợp lệ
//   for (const t of toppings) {
//     const topping = await Topping.findById(t.toppingId);
//     if (!topping) {
//       throw new ApiError(
//         httpStatus.BAD_REQUEST,
//         `Topping không tồn tại: ${t.toppingId}`
//       );
//     }
//   }

//   let cart = await Cart.findOne({ userId });
//   if (!cart) {
//     cart = await Cart.create({
//       userId,
//       items: [{ productId, quantity, customization, toppings, note }],
//     });
//     return cart;
//   }

//   // 🔍 Tìm sản phẩm trùng customization + topping
//   const existingItem = cart.items.find(
//     (item) =>
//       item.productId.toString() === productId &&
//       isSameCustomization(item.customization, customization) &&
//       isSameToppings(item.toppings, toppings)
//   );

//   if (existingItem) {
//     existingItem.quantity += quantity;
//   } else {
//     cart.items.push({ productId, quantity, customization, toppings, note });
//   }

//   await cart.save();
//   return cart;
// };

// /**
//  * 📦 Lấy giỏ hàng của user
//  */
// const getCartByUserId = async (userId) => {
//   const cart = await Cart.findOne({ userId })
//     .populate("items.productId")
//     .populate("items.toppings.toppingId");
//   if (!cart) throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");
//   return cart;
// };

// /**
//  * ✏️ Cập nhật item trong giỏ hàng
//  */
// const updateCartItem = async (userId, itemId, updateData) => {
//   const cart = await Cart.findOne({ userId });
//   if (!cart) throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");

//   const item =
//     cart.items.id(itemId) ||
//     cart.items.find((i) => i._id?.toString() === itemId);
//   if (!item) throw new ApiError(httpStatus.NOT_FOUND, "Item not found");

//   if (updateData.quantity !== undefined) item.quantity = updateData.quantity;
//   if (updateData.customization) item.customization = updateData.customization;
//   if (updateData.toppings) item.toppings = updateData.toppings;
//   if (updateData.note !== undefined) item.note = updateData.note;

//   await cart.save();
//   return cart;
// };

// /**
//  * ❌ Xóa 1 sản phẩm trong giỏ
//  */
// const removeCartItem = async (userId, itemId) => {
//   const cart = await Cart.findOne({ userId });
//   if (!cart) throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");

//   cart.items = cart.items.filter((item) => item._id?.toString() !== itemId);
//   await cart.save();
//   return cart;
// };

// /**
//  * 🧹 Xóa toàn bộ giỏ
//  */
// const clearCart = async (userId) => {
//   const cart = await Cart.findOne({ userId });
//   if (!cart) throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");

//   cart.items = [];
//   await cart.save();
//   return cart;
// };

// module.exports = {
//   addToCart,
//   getCartByUserId,
//   updateCartItem,
//   removeCartItem,
//   clearCart,
// };

const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");

/**
 * 🧩 So sánh customization giữa hai object
 */
const isSameCustomization = (a = {}, b = {}) => {
  return (
    (a.ice || 0) === (b.ice || 0) &&
    (a.sugar || 0) === (b.sugar || 0) &&
    (a.description || "") === (b.description || "")
  );
};

/**
 * 🛒 Thêm sản phẩm vào giỏ hàng
 */
const addToCart = async (userId, cartBody) => {
  const { productId, quantity = 1, customization = {}, note = "" } = cartBody;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({
      userId,
      items: [{ productId, quantity, customization, note }],
    });
    return cart;
  }

  // 🔍 Kiểm tra sản phẩm trùng (cùng loại & customization)
  const existingItem = cart.items.find(
    (item) =>
      item.productId.toString() === productId &&
      isSameCustomization(item.customization, customization)
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity, customization, note });
  }

  await cart.save();
  return cart;
};

/**
 * 📦 Lấy giỏ hàng của user
 */
const getCartByUserId = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate("items.productId");
  if (!cart) throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");
  return cart;
};

/**
 * ✏️ Cập nhật item trong giỏ hàng
 */
const updateCartItem = async (userId, itemId, updateData) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");

  const item =
    cart.items.id(itemId) ||
    cart.items.find((i) => i._id?.toString() === itemId);
  if (!item) throw new ApiError(httpStatus.NOT_FOUND, "Item not found");

  if (updateData.quantity !== undefined) item.quantity = updateData.quantity;
  if (updateData.customization) item.customization = updateData.customization;
  if (updateData.note !== undefined) item.note = updateData.note;

  await cart.save();
  return cart;
};

/**
 * ❌ Xóa 1 sản phẩm trong giỏ
 */
const removeCartItem = async (userId, itemId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");

  cart.items = cart.items.filter((item) => item._id?.toString() !== itemId);
  await cart.save();
  return cart;
};

/**
 * 🧹 Xóa toàn bộ giỏ
 */
const clearCart = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");

  cart.items = [];
  await cart.save();
  return cart;
};

module.exports = {
  addToCart,
  getCartByUserId,
  updateCartItem,
  removeCartItem,
  clearCart,
};

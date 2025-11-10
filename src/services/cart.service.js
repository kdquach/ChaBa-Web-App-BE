/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Topping = require("../models/topping.model");
const User = require("../models/user.model");

/**
 * So sánh topping giữa hai mảng
 */
const isSameToppings = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  const sortFn = (arr) =>
    arr
      .map((t) => `${t.toppingId}:${t.quantity}`)
      .sort()
      .join(",");
  return sortFn(a) === sortFn(b);
};

/**
 * So sánh customization giữa hai object
 */
const isSameCustomization = (a = {}, b = {}) => {
  return (
    (a.size || "S") === (b.size || "S") &&
    (a.ice ?? 100) === (b.ice ?? 100) &&
    (a.sugar ?? 100) === (b.sugar ?? 100) &&
    (a.description || "") === (b.description || "")
  );
};

/**
 * Thêm sản phẩm vào giỏ hàng
 */
const addToCart = async (userId, cartBody) => {
  const {
    productId,
    quantity = 1,
    customization = {},
    toppings = [],
    note = "",
  } = cartBody;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  const product = await Product.findById(productId).populate("toppings");
  if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");

  // Gán giá trị mặc định nếu không có customization
  const normalizedCustomization = {
    size: customization.size || "S",
    ice: customization.ice ?? 100,
    sugar: customization.sugar ?? 100,
    description: customization.description || "",
  };

  // Kiểm tra topping hợp lệ
  for (const t of toppings) {
    const topping = await Topping.findById(t.toppingId);
    if (!topping) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Topping không tồn tại: ${t.toppingId}`
      );
    }
    const isValid = product.toppings.some(
      (pt) => pt._id.toString() === t.toppingId.toString()
    );
    if (!isValid) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Topping ${topping.name} không thuộc sản phẩm này`
      );
    }
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({
      userId,
      items: [
        {
          productId,
          quantity,
          customization: normalizedCustomization,
          toppings,
          note,
        },
      ],
    });
    return cart;
  }

  // Kiểm tra sản phẩm trùng customization + topping
  const existingItem = cart.items.find(
    (item) =>
      item.productId.toString() === productId &&
      isSameCustomization(item.customization, normalizedCustomization) &&
      isSameToppings(item.toppings, toppings)
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      productId,
      quantity,
      customization: normalizedCustomization,
      toppings,
      note,
    });
  }

  await cart.save();
  return cart;
};

/**
 * Lấy giỏ hàng của user
 */
const getCartByUserId = async (userId) => {
  const cart = await Cart.findOne({ userId })
    .populate("items.productId")
    .populate("items.toppings.toppingId");

  if (!cart) throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");
  return cart;
};

/**
 * Cập nhật item trong giỏ hàng
 */
const updateCartItem = async (userId, itemId, updateData) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");

  const item =
    cart.items.id(itemId) ||
    cart.items.find((i) => i._id?.toString() === itemId);
  if (!item) throw new ApiError(httpStatus.NOT_FOUND, "Item not found");

  // Kiểm tra topping hợp lệ khi cập nhật
  if (updateData.toppings) {
    const product = await Product.findById(item.productId).populate("toppings");
    for (const t of updateData.toppings) {
      const topping = await Topping.findById(t.toppingId);
      if (!topping) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Topping không tồn tại: ${t.toppingId}`
        );
      }
      const isValid = product.toppings.some(
        (pt) => pt._id.toString() === t.toppingId.toString()
      );
      if (!isValid) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Topping ${topping.name} không thuộc sản phẩm này`
        );
      }
    }
    item.toppings = updateData.toppings;
  }

  if (updateData.quantity !== undefined) item.quantity = updateData.quantity;

  if (updateData.customization) {
    item.customization = {
      size: updateData.customization.size || "S",
      ice: updateData.customization.ice ?? 100,
      sugar: updateData.customization.sugar ?? 100,
      description: updateData.customization.description || "",
    };
  }

  if (updateData.note !== undefined) item.note = updateData.note;

  await cart.save();
  return cart;
};

/**
 * Xóa 1 sản phẩm trong giỏ
 */
const removeCartItem = async (userId, itemId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");

  cart.items = cart.items.filter((item) => item._id?.toString() !== itemId);
  await cart.save();
  return cart;
};

/**
 * Xóa toàn bộ giỏ
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

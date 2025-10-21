/* eslint-disable prettier/prettier */
const Joi = require("joi");

const addToCart = {
  body: Joi.object().keys({
    productId: Joi.string().required().messages({
      "any.required": "productId là bắt buộc",
    }),
    quantity: Joi.number().integer().min(1).required().messages({
      "number.min": "Số lượng phải lớn hơn 0",
      "any.required": "quantity là bắt buộc",
    }),
    customization: Joi.object({
      ice: Joi.number().min(0).max(100),
      sugar: Joi.number().min(0).max(100),
      description: Joi.string().allow(""),
    }).optional(),
    toppings: Joi.array()
      .items(
        Joi.object({
          toppingId: Joi.string().required(),
          quantity: Joi.number().integer().min(1).required(),
        })
      )
      .optional(),
    note: Joi.string().allow("").optional(),
  }),
};

const updateCartItem = {
  params: Joi.object().keys({
    itemId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    quantity: Joi.number().integer().min(1).required().messages({
      "number.min": "Số lượng phải lớn hơn 0",
      "any.required": "quantity là bắt buộc",
    }),
    customization: Joi.object({
      ice: Joi.number().min(0).max(100),
      sugar: Joi.number().min(0).max(100),
      description: Joi.string().allow(""),
    }).optional(),
    toppings: Joi.array()
      .items(
        Joi.object({
          toppingId: Joi.string().required(),
          quantity: Joi.number().integer().min(1).required(),
        })
      )
      .optional(),
    note: Joi.string().allow("").optional(),
  }),
};

const getCart = {}; // không cần params hay body, lấy theo user hiện tại
const removeCartItem = {
  params: Joi.object().keys({
    itemId: Joi.string().required(),
  }),
};
const clearCart = {}; // xóa toàn bộ giỏ, không cần body hay params
const getAllCarts = {
  query: Joi.object().keys({
    userId: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  addToCart,
  updateCartItem,
  getCart,
  removeCartItem,
  clearCart,
  getAllCarts,
};

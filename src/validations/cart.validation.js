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
      size: Joi.string().valid("S", "M", "L").optional(),
      ice: Joi.number().min(0).max(100).optional(),
      sugar: Joi.number().min(0).max(100).optional(),
      description: Joi.string().allow("").optional(),
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
    itemId: Joi.string().required().messages({
      "any.required": "itemId là bắt buộc",
    }),
  }),
  body: Joi.object()
    .keys({
      quantity: Joi.number().integer().min(1).optional(),
      customization: Joi.object({
        size: Joi.string().valid("S", "M", "L").optional(),
        ice: Joi.number().min(0).max(100).optional(),
        sugar: Joi.number().min(0).max(100).optional(),
        description: Joi.string().allow("").optional(),
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
    })
    .min(1)
    .messages({
      "object.min": "Cần có ít nhất một trường để cập nhật",
    }),
};

const removeCartItem = {
  params: Joi.object().keys({
    itemId: Joi.string().required().messages({
      "any.required": "itemId là bắt buộc",
    }),
  }),
};

const clearCart = {}; // Không cần validate
const getCart = {}; // Không cần validate

module.exports = {
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCart,
};

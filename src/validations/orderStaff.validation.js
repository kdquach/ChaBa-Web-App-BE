/* eslint-disable prettier/prettier */
const Joi = require("joi");
const { objectId } = require("./custom.validation");

const getOrders = {
  query: Joi.object().keys({
    status: Joi.string().valid(
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "completed",
      "cancelled"
    ),
    userId: Joi.string().custom(objectId).optional(),
    search: Joi.string().optional().allow(""),
    sortBy: Joi.string().optional(),
    limit: Joi.number().integer().optional(),
    page: Joi.number().integer().optional(),
  }),
};

const getOrderById = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId).required().messages({
      "any.required": "orderId là bắt buộc",
      "string.empty": "orderId không được để trống",
    }),
  }),
};

const updateOrderStatus = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId).required().messages({
      "any.required": "orderId là bắt buộc",
    }),
  }),
  body: Joi.object()
    .keys({
      newStatus: Joi.string()
        .valid(
          "pending",
          "confirmed",
          "preparing",
          "ready",
          "completed",
          "cancelled"
        )
        .required()
        .messages({
          "any.required": "Trạng thái mới (newStatus) là bắt buộc",
          "any.only":
            "Trạng thái không hợp lệ. Các giá trị hợp lệ: pending, confirmed, preparing, ready, completed, cancelled",
        }),
      note: Joi.string().allow("", null),
    })
    .required(),
};

const getOrderLogs = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId).required().messages({
      "any.required": "orderId là bắt buộc",
    }),
  }),
};

const deleteOrderLog = {
  params: Joi.object().keys({
    logId: Joi.string().custom(objectId).required().messages({
      "any.required": "logId là bắt buộc",
    }),
  }),
};

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderLogs,
  deleteOrderLog,
};

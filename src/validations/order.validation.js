const Joi = require("joi");
const { objectId } = require("./custom.validation");

const orderToppingSchema = Joi.object({
  toppingId: Joi.string().custom(objectId).required(),
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
});

const orderItemSchema = Joi.object({
  productId: Joi.string().custom(objectId).required(),
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().integer().min(1).required(),
  toppings: Joi.array().items(orderToppingSchema).default([]),
  customization: Joi.object({
    size: Joi.string().valid("S", "M", "L"),
    description: Joi.string().allow("", null),
  }).allow(null),
});

const paymentSchema = Joi.object({
  method: Joi.string().valid("cash", "card").required(),
  status: Joi.string()
    .valid("pending", "completed", "failed")
    .default("pending"),
  transactionId: Joi.string().allow("", null),
  amountPaid: Joi.number().min(0).default(0),
  paidAt: Joi.date().allow(null),
});

const createOrder = {
  body: Joi.object({
    shippingAddress: Joi.string().required().messages({
      "any.required": "Vui lòng cung cấp địa chỉ giao hàng",
    }),
    products: Joi.array().items(orderItemSchema).min(1).required(),
    totalAmount: Joi.number().min(0).required(),
    shippingFee: Joi.number().min(0).default(0),
    note: Joi.string().allow("", null),
    deliveredAt: Joi.date().allow(null),
    payment: paymentSchema,
    status: Joi.string()
      .valid(
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "completed",
        "cancelled"
      )
      .default("pending"),
  }),
};
const updateOrderStatus = {
  params: Joi.object({
    orderId: Joi.string().custom(objectId).required(),
    status: Joi.string()
      .valid(
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "completed",
        "cancelled"
      )
      .required(),
  }),
};
const getOrderById = {
  params: Joi.object({
    orderId: Joi.string().custom(objectId).required(),
  }),
};
const getOrders = {
  query: Joi.object().keys({
    search: Joi.string().allow("").optional(), // tìm theo tên người dùng, id, địa chỉ, ...
    status: Joi.string()
      .valid(
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "completed",
        "cancelled"
      )
      .optional(),
    paymentStatus: Joi.string()
      .valid("pending", "completed", "failed")
      .optional(),
    fromDate: Joi.date().iso().optional(), // ISO format (YYYY-MM-DD)
    toDate: Joi.date().iso().optional(),
    sortBy: Joi.string().valid("createdAt", "totalAmount").default("createdAt"),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

module.exports = {
  createOrder,
  updateOrderStatus,
  getOrderById,
  getOrders,
};

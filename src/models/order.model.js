/* eslint-disable prettier/prettier */
const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
// const productSchema = require("./product.model");

const OrderToppingSchema = mongoose.Schema({
  toppingId: {
    // Tham chiếu đến Topping gốc
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topping", // Giả định bạn đã tạo Topping Model
    required: true,
  },
  name: {
    // Snapshot: Tên topping tại thời điểm mua
    type: String,
    required: true,
  },
  price: {
    // Snapshot: Giá topping tại thời điểm mua
    type: Number,
    required: true,
    min: 0,
  },
});

const OrderItemSchema = mongoose.Schema(
  {
    productId: {
      // Tham chiếu đến Product gốc
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      // Giá cơ bản của Product/Item
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    toppings: [OrderToppingSchema],
  },
  {
    timestamps: true,
  }
);

const PaymentSchema = mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["cash", "card"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    transactionId: { type: String },
    amountPaid: { type: Number, default: 0 },
    paidAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const orderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    products: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: { type: Number, default: 0 },
    note: { type: String }, // ghi chú toàn đơn hàng
    deliveredAt: { type: Date },
    payment: PaymentSchema,
    status: {
      type: String,
      enum: ["pending", "completed", "canceled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

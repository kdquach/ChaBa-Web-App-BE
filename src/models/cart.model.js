/* eslint-disable prettier/prettier */
const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const productSchema = require("./product.model");

const cart = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [productSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

cart.plugin(toJSON);
cart.plugin(paginate);

const Cart = mongoose.model("Cart", cart);

module.exports = Cart;

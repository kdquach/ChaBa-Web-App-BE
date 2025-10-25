/* eslint-disable prettier/prettier */
const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const customizationSchema = mongoose.Schema({
  size: {
    type: String,
    required: false,
    enum: ["S", "M", "L"],
  },
  ice: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
  },
  sugar: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
  },
  description: {
    type: String,
    required: false,
  },
});

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    required: true,
    trim: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductCategory",
    required: true,
  },
  status: {
    type: String,
    enum: ["Đang bán", "Ngừng bán"],
    default: "Đang bán",
  },
  recipe: {
    type: [
      {
        ingredientId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredient",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    default: [],
  },
  toppings: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Topping",
    default: [],
  },
  customization: {
    type: customizationSchema,
    required: false,
  },
});

productSchema.plugin(toJSON);
productSchema.plugin(paginate);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;

/* eslint-disable prettier/prettier */
const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const toppingSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const recipeItemSchema = mongoose.Schema({
  ingredientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const customizationSchema = mongoose.Schema({
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
  describtion: {
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
  toppings: {
    type: [toppingSchema],
    required: false,
    default: [],
  },
  customization: {
    type: customizationSchema,
    required: false,
  },
  recipe: {
    type: [recipeItemSchema],
    required: false,
    default: [],
  },
});

productSchema.plugin(toJSON);
productSchema.plugin(paginate);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;

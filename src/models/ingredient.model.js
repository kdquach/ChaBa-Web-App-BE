const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

require("./ingredientCategories.model");

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    minStock: {
      type: Number,
      required: true,
      min: 0,
    },
    maxStock: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    expiryDate: {
      type: Date,
    },
    supplier: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IngredientCategory",
    },
  },
  { timestamps: true }
);

ingredientSchema.plugin(toJSON);
ingredientSchema.plugin(paginate);

const Ingredient = mongoose.model("Ingredient", ingredientSchema);
module.exports = Ingredient;

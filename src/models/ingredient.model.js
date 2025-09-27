/* eslint-disable prettier/prettier */
const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const ingredientCategorySchema = require("./ingredientCategories.model");

const ingredientSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: false,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  category: ingredientCategorySchema,
});

ingredientSchema.plugin(toJSON);
ingredientSchema.plugin(paginate);

const Ingredient = mongoose.model("Ingredient", ingredientSchema);

module.exports = Ingredient;

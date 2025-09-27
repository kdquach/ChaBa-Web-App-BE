/* eslint-disable prettier/prettier */
const mongoose = require("mongoose");

const ingredientCategorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
});

const ingredientCategory = mongoose.model(
  "IngredientCategory",
  ingredientCategorySchema
);

module.exports = ingredientCategory;

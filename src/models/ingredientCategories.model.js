const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const ingredientCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

ingredientCategorySchema.plugin(toJSON);
ingredientCategorySchema.plugin(paginate);

const IngredientCategory = mongoose.model(
  "IngredientCategory",
  ingredientCategorySchema
);
module.exports = IngredientCategory;

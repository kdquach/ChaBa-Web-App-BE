const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const Ingredient = require("../models/ingredient.model");

/**
 * Query for ingredients
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */

const createIngredient = async (ingredientBody) => {
  try {
    const exist = await Ingredient.findOne({ name: ingredientBody.name });
    if (exist) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Ingredient name already exists"
      );
    }

    const ingredient = await Ingredient.create(ingredientBody);
    return ingredient;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error; // Giữ nguyên lỗi custom
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error creating ingredient"
    );
  }
};

/**
 * Query for ingredients
 */
const queryIngredients = async (filter, options = {}) => {
  const queryOptions = { ...options, populate: "categoryId" };
  const ingredients = await Ingredient.paginate(filter, queryOptions);
  return ingredients;
};

/**
 * Get ingredient by ID
 */
const getIngredientById = async (id) => {
  const ingredient = await Ingredient.findById(id).populate("category");
  if (!ingredient)
    throw new ApiError(httpStatus.NOT_FOUND, "Ingredient not found");
  return ingredient;
};

/**
 * Update ingredient by ID
 */
const updateIngredientById = async (id, updateBody) => {
  const ingredient = await getIngredientById(id);
  Object.assign(ingredient, updateBody);
  await ingredient.save();
  return ingredient;
};

/**
 * Delete ingredient by ID
 */
const deleteIngredientById = async (id) => {
  const ingredient = await getIngredientById(id);
  await ingredient.deleteOne();
  return ingredient;
};

module.exports = {
  createIngredient,
  queryIngredients,
  getIngredientById,
  updateIngredientById,
  deleteIngredientById,
};

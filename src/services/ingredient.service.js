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
const queryIngredients = async (filter, options) => {
  const ingredients = await Ingredient.paginate(filter, options);
  return ingredients;
};

module.exports = {
  queryIngredients,
};

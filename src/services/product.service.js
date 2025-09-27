/* eslint-disable prettier/prettier */
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const Product = require("../models/product.model");

/**
 * Create a product
 * @param {Object} productBody
 * @returns {Promise<Product>}
 */
const createProduct = async (productBody) => {
  try {
    const product = await Product.create(productBody);
    return product;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Product name already exists");
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error creating product"
    );
  }
};

/**
 * Query for products
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryProducts = async (filter, options) => {
  const products = await Product.paginate(filter, options);
  return products;
};

/**
 * Get product by id
 * @param {ObjectId} id
 * @returns {Promise<Product>}
 */
const getProductById = async (id) => {
  return Product.findById(id);
};

/**
 * Get product by name
 * @param {string} name
 * @returns {Promise<Product>}
 */
const getProductByName = async (name) => {
  return Product.findOne({ name });
};

/**
 * Update product by id
 * @param {ObjectId} productId
 * @param {Object} updateBody
 * @returns {Promise<Product>}
 */
const updateProductById = async (productId, updateBody) => {
  const product = await Product.findByIdAndUpdate(productId, updateBody, {
    new: true,
  });
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }
  return product;
};

/**
 * Delete product by id
 * @param {ObjectId} productId
 * @returns {Promise<Product>}
 */
const deleteProductById = async (productId) => {
  const product = await Product.findByIdAndDelete(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }
  return product;
};

module.exports = {
  createProduct,
  queryProducts,
  getProductById,
  getProductByName,
  updateProductById,
  deleteProductById,
};

const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const Category = require("../models/productCategories.model");

/**
 * Query for categories
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryCategories = async (filter, options) => {
  const categories = await Category.paginate(filter, options);
  return categories;
};

/**
 * Create a category
 * @param {Object} categoryBody
 * @returns {Promise<Category>}
 */
const createCategory = async (categoryBody) => {
  // Kiểm tra trùng tên (không phân biệt hoa thường, bỏ khoảng trắng)
  const name = (categoryBody.name || "").trim();
  if (!name) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Category name is required");
  }

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const nameRegex = new RegExp(`^${escapeRegExp(name)}$`, "i");
  const existing = await Category.findOne({ name: { $regex: nameRegex } });
  if (existing) {
    // 409: Conflict
    throw new ApiError(httpStatus.CONFLICT, "Tên danh mục đã tồn tại");
  }

  const category = await Category.create({ ...categoryBody, name });
  return category;
};

/**
 * Get category by id
 * @param {ObjectId} id
 * @returns {Promise<Category>}
 */
const getCategoryById = async (id) => {
  return Category.findById(id);
};

/**
 * Update category by id
 * @param {ObjectId} categoryId
 * @param {Object} updateBody
 * @returns {Promise<Category>}
 */
const updateCategoryById = async (categoryId, updateBody) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }

  // Nếu cập nhật tên, kiểm tra trùng tên (case-insensitive) với các bản ghi khác
  if (typeof updateBody.name === "string") {
    const newName = updateBody.name.trim();
    if (!newName) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Category name is required");
    }
    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const nameRegex = new RegExp(`^${escapeRegExp(newName)}$`, "i");
    const existing = await Category.findOne({
      _id: { $ne: categoryId },
      name: { $regex: nameRegex },
    });
    if (existing) {
      throw new ApiError(httpStatus.CONFLICT, "Tên danh mục đã tồn tại");
    }
    updateBody.name = newName;
  }
  Object.assign(category, updateBody);
  await category.save();
  return category;
};

/**
 * Delete category by id
 * @param {ObjectId} categoryId
 * @returns {Promise<Category>}
 */
const deleteCategoryById = async (categoryId) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }
  await category.deleteOne();
  return category;
};

module.exports = {
  queryCategories,
  createCategory,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
};

const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const IngredientCategory = require("../models/ingredientCategories.model");

/**
 * Tạo mới Ingredient Category
 * @param {Object} categoryBody - Dữ liệu category cần tạo
 * @returns {Promise<IngredientCategory>}
 */
const createIngredientCategory = async (categoryBody) => {
  try {
    const exist = await IngredientCategory.findOne({ name: categoryBody.name });
    if (exist) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Category name already exists"
      );
    }

    const category = await IngredientCategory.create(categoryBody);
    return category;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error creating category"
    );
  }
};

/**
 * Lấy danh sách Ingredient Categories (có phân trang + filter)
 * @param {Object} filter - Bộ lọc Mongo
 * @param {Object} options - Tuỳ chọn phân trang/sắp xếp
 * @returns {Promise<QueryResult>}
 */
const queryIngredientCategories = async (filter, options = {}) => {
  const categories = await IngredientCategory.paginate(filter, options);
  return categories;
};

/**
 * Lấy category theo ID
 * @param {ObjectId} id
 * @returns {Promise<IngredientCategory>}
 */
const getIngredientCategoryById = async (id) => {
  const category = await IngredientCategory.findById(id);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Ingredient category not found");
  }
  return category;
};

/**
 * Cập nhật category theo ID
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<IngredientCategory>}
 */
const updateIngredientCategoryById = async (id, updateBody) => {
  const category = await getIngredientCategoryById(id);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Ingredient category not found");
  }

  // 🟡 Kiểm tra trùng tên (chỉ khi tên mới khác tên cũ)
  if (updateBody.name && updateBody.name !== category.name) {
    const exist = await IngredientCategory.findOne({ name: updateBody.name });
    if (exist) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Category name already exists"
      );
    }
  }

  Object.assign(category, updateBody);
  await category.save();
  return category;
};

/**
 * Xoá category theo ID
 * @param {ObjectId} id
 * @returns {Promise<IngredientCategory>}
 */
const deleteIngredientCategoryById = async (id) => {
  const category = await getIngredientCategoryById(id);
  await category.deleteOne();
  return category;
};

/**
 * Lấy danh sách chỉ gồm tên của các Ingredient Category
 * @returns {Promise<Array<{ name: string }>>}
 */
const getIngredientCategoryNames = async () => {
  try {
    const names = await IngredientCategory.find({}, "name"); // chỉ lấy trường name
    return names;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error fetching ingredient category names"
    );
  }
};

module.exports = {
  createIngredientCategory,
  queryIngredientCategories,
  getIngredientCategoryById,
  updateIngredientCategoryById,
  deleteIngredientCategoryById,
  getIngredientCategoryNames,
};

const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const ingredientCategoryService = require("../services/ingredientCategory.service");

// 🟢 Tạo mới category
const createIngredientCategory = catchAsync(async (req, res) => {
  const category = await ingredientCategoryService.createIngredientCategory(
    req.body
  );
  res.status(httpStatus.CREATED).send(category);
});

// 🟡 Lấy danh sách category (có filter + phân trang)
const getAllIngredientCategories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "isActive"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const categories = await ingredientCategoryService.queryIngredientCategories(
    filter,
    options
  );
  res.status(httpStatus.OK).send(categories);
});

// 🔵 Lấy 1 category theo ID
const getIngredientCategory = catchAsync(async (req, res) => {
  const category = await ingredientCategoryService.getIngredientCategoryById(
    req.params.categoryId
  );
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Ingredient category not found");
  }
  res.status(httpStatus.OK).send(category);
});

// 🟣 Cập nhật category
const updateIngredientCategory = catchAsync(async (req, res) => {
  const category = await ingredientCategoryService.updateIngredientCategoryById(
    req.params.categoryId,
    req.body
  );
  res.status(httpStatus.OK).send(category);
});

// 🔴 Xóa category
const deleteIngredientCategory = catchAsync(async (req, res) => {
  await ingredientCategoryService.deleteIngredientCategoryById(
    req.params.categoryId
  );
  res
    .status(httpStatus.OK)
    .send({ message: "Ingredient category deleted successfully" });
});

// 🟢 Lấy danh sách chỉ có tên category (phục vụ cho select)
const getIngredientCategoryNames = catchAsync(async (req, res) => {
  const names = await ingredientCategoryService.getIngredientCategoryNames();
  res.status(httpStatus.OK).send(names);
});

module.exports = {
  createIngredientCategory,
  getAllIngredientCategories,
  getIngredientCategory,
  updateIngredientCategory,
  deleteIngredientCategory,
  getIngredientCategoryNames,
};

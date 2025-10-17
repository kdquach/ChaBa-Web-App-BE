const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { categoryService } = require("../services");

const getCategories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name"]); // lọc field filter
  const options = pick(req.query, ["sortBy", "limit", "page"]); // lọc field option
  const categories = await categoryService.queryCategories(filter, options);
  res.status(httpStatus.OK).send(categories);
});
const getCategory = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }
  res.status(httpStatus.OK).send(category);
});

const createCategory = catchAsync(async (req, res) => {
  const categoryData = req.body;
  const category = await categoryService.createCategory(categoryData);
  res.status(httpStatus.CREATED).send(category);
});

const updateCategory = catchAsync(async (req, res) => {
  const updateData = req.body;
  const category = await categoryService.updateCategoryById(
    req.params.categoryId,
    updateData
  );
  res.status(httpStatus.OK).send(category);
});

const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategoryById(req.params.categoryId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
};

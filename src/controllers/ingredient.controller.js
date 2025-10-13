const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { ingredientService } = require("../services");

// Tạo mới ingredient
const createIngredient = catchAsync(async (req, res) => {
  const ingredient = await ingredientService.createIngredient(req.body);
  res.status(httpStatus.CREATED).send(ingredient);
});

// Lấy danh sách ingredients (có filter + phân trang)
const getAllIngredient = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "unit", "categoryId"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  options.populate = "categoryId";
  const ingredients = await ingredientService.queryIngredients(filter, options);
  res.status(httpStatus.OK).send(ingredients);
});

// Lấy 1 ingredient theo id
const getIngredient = catchAsync(async (req, res) => {
  const ingredient = await ingredientService.getIngredientById(
    req.params.ingredientId
  );
  if (!ingredient) {
    throw new ApiError(httpStatus.NOT_FOUND, "Ingredient not found");
  }
  res.status(httpStatus.OK).send(ingredient);
});

// Cập nhật ingredient
const updateIngredient = catchAsync(async (req, res) => {
  const ingredient = await ingredientService.updateIngredientById(
    req.params.ingredientId,
    req.body
  );
  res.status(httpStatus.OK).send(ingredient);
});

// Xóa ingredient
const deleteIngredient = catchAsync(async (req, res) => {
  await ingredientService.deleteIngredientById(req.params.ingredientId);
  res
    .status(httpStatus.OK)
    .send({ message: "Ingredient deleted successfully" });
});

module.exports = {
  createIngredient,
  getAllIngredient,
  getIngredient,
  updateIngredient,
  deleteIngredient,
};

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

module.exports = {
  getCategories,
};

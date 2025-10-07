/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { productService } = require("../services");

const createProduct = catchAsync(async (req, res) => {
  // Lấy URL ảnh từ middleware upload
  const imageUrl = req.file ? req.file.path : null;

  // Tạo product với data từ body và imageUrl
  const productData = {
    ...req.body,
    image: imageUrl,
  };

  const product = await productService.createProduct(productData);
  res.status(httpStatus.CREATED).send(product);
});

const getProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "category", "status"]); // lọc field filter
  const options = pick(req.query, ["sortBy", "limit", "page"]); // lọc field option
  options.populate = "category"; // populate category details
  const products = await productService.queryProducts(filter, options);
  res.status(httpStatus.OK).send(products);
});

const getProduct = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }
  res.status(httpStatus.OK).send(product);
});

const updateProduct = catchAsync(async (req, res) => {
  // Lấy URL ảnh từ middleware upload nếu có upload ảnh mới
  const imageUrl = req.file ? req.file.path : null;

  // Tạo update data với data từ body và imageUrl (nếu có)
  const updateData = {
    ...req.body,
    ...(imageUrl && { image: imageUrl }), // Chỉ cập nhật image nếu có upload ảnh mới
  };

  const product = await productService.updateProductById(
    req.params.productId,
    updateData
  );
  res.status(httpStatus.OK).send(product);
});

const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProductById(req.params.productId);
  res.status(httpStatus.OK).send({ message: "Product deleted successfully" });
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};

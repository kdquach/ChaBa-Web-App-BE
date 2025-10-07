/* eslint-disable prettier/prettier */
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const Product = require("../models/product.model");
const cloudinary = require("../config/cloudinary");

/**
 * Create a product
 * @param {Object} productBody
 * @returns {Promise<Product>}
 */
const createProduct = async (productBody) => {
  try {
    // Middleware upload.single('image') đã xử lý upload ảnh lên Cloudinary
    // và thêm req.file vào request
    if (!productBody.image) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Product image is required");
    }

    console.log("createBody:", productBody);

    const product = await Product.create({
      ...productBody,
      image: productBody.image, // URL của ảnh từ Cloudinary (đã được xử lý bởi middleware)
    });

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
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  // Nếu có ảnh mới, có thể xóa ảnh cũ trên Cloudinary
  if (updateBody.image && product.image) {
    try {
      // Lấy public_id từ URL của ảnh cũ
      const publicId = product.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`product_images/${publicId}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error deleting old image:", error);
      // Không throw error vì việc xóa ảnh cũ không quan trọng bằng việc cập nhật sản phẩm
    }
  }
  // Cập nhật sản phẩm
  Object.assign(product, updateBody);
  await product.save();
  return product;
};

/**
 * Delete product by id
 * @param {ObjectId} productId
 * @returns {Promise<Product>}
 */
const deleteProductById = async (productId) => {
  const product = await getProductById(productId);

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  if (product.image) {
    try {
      const publicId = product.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`product_images/${publicId}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error deleting old image:", error);
    }
  }

  const deletedProduct = await Product.findByIdAndDelete(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }
  return deletedProduct;
};

module.exports = {
  createProduct,
  queryProducts,
  getProductById,
  getProductByName,
  updateProductById,
  deleteProductById,
};

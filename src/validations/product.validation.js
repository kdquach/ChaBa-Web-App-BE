/* eslint-disable prettier/prettier */
const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    price: Joi.number().min(0).required(),
    categoryId: Joi.string().custom(objectId).required(),
    image: Joi.string(), // 👈 thêm
    description: Joi.string(), // 👈 thêm
    status: Joi.string().valid("Đang bán", "Ngừng bán"), // 👈 nếu bạn có status
    recipe: Joi.array().items(
      Joi.object().keys({
        _id: Joi.string().custom(objectId), // nếu có sẵn trong DB
        ingredientId: Joi.string().custom(objectId).required(),
        quantity: Joi.number().min(1).required(),
      })
    ),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      price: Joi.number().min(0),
      image: Joi.string(), // 👈 thêm
      description: Joi.string(), // 👈 thêm
      status: Joi.string().valid("Đang bán", "Ngừng bán"), // 👈 nếu bạn có status
      recipe: Joi.array().items(
        // 👈 nếu có mảng nguyên liệu
        Joi.object().keys({
          _id: Joi.string().custom(objectId),
          ingredientId: Joi.string().custom(objectId),
          quantity: Joi.number().min(1),
        })
      ),
      categoryId: Joi.string().custom(objectId),
    })
    .min(1),
};

const getProducts = {
  params: Joi.object().keys({
    name: Joi.string(),
    category: Joi.string().custom(objectId),
    price: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId).required(),
  }),
};

const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
};

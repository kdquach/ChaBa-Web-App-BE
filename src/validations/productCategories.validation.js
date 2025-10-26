/* eslint-disable prettier/prettier */
const Joi = require("joi");

const createProductCategories = {
  body: Joi.object().keys({
    name: Joi.string()
      .trim()
      .pattern(/^[\p{L}\p{N}\s]+$/u)
      .required()
      .messages({
        "string.pattern.base": "Tên danh mục không được chứa ký tự đặc biệt",
      }),
    description: Joi.string().allow(""),
  }),
};
const updateProductCategories = {
  params: Joi.object().keys({
    categoryId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string()
      .trim()
      .pattern(/^[\p{L}\p{N}\s]+$/u)
      .required()
      .messages({
        "string.pattern.base": "Tên danh mục không được chứa ký tự đặc biệt",
      }),
    description: Joi.string().allow(""),
  }),
};
const getProductCategories = {
  query: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};
const getProductCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().required(),
  }),
};
const deleteProductCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().required(),
  }),
};
module.exports = {
  createProductCategories,
  updateProductCategories,
  getProductCategories,
  getProductCategory,
  deleteProductCategory,
};

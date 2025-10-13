const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createIngredient = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    unit: Joi.string().required(),
    stock: Joi.number().min(0).required(),
    minStock: Joi.number().min(0).required(),
    maxStock: Joi.number().min(0).required(),
    price: Joi.number().min(0).required(),
    expiryDate: Joi.date().optional(),
    supplier: Joi.string().optional(),
    description: Joi.string().optional(),
    categoryId: Joi.string().custom(objectId).optional(),
  }),
};

const updateIngredient = {
  params: Joi.object().keys({
    ingredientId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      unit: Joi.string(),
      stock: Joi.number().min(0),
      minStock: Joi.number().min(0),
      maxStock: Joi.number().min(0),
      price: Joi.number().min(0),
      expiryDate: Joi.date(),
      supplier: Joi.string(),
      description: Joi.string(),
      categoryId: Joi.string().custom(objectId),
    })
    .min(1),
};

const getAllIngredient = {
  query: Joi.object().keys({
    name: Joi.string(),
    unit: Joi.string(),
    categoryId: Joi.string().custom(objectId),
    supplier: Joi.string(),
    minStock: Joi.number().min(0),
    maxStock: Joi.number().min(0),
    price: Joi.number().min(0),
    expiryDate: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getIngredient = {
  params: Joi.object().keys({
    ingredientId: Joi.string().custom(objectId).required(),
  }),
};

const deleteIngredient = {
  params: Joi.object().keys({
    ingredientId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createIngredient,
  updateIngredient,
  getAllIngredient,
  getIngredient,
  deleteIngredient,
};

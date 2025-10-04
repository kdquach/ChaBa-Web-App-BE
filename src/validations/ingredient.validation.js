const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createIngredient = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    unit: Joi.string().required(),
    quantity: Joi.number().min(0).required(),
    price: Joi.number().min(0).required(),
    supplier: Joi.string().allow(""),
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
      quantity: Joi.number().min(0),
      price: Joi.number().min(0),
      supplier: Joi.string().allow(""),
    })
    .min(1), // ít nhất phải có 1 trường để update
};

const getIngredients = {
  query: Joi.object().keys({
    name: Joi.string(),
    unit: Joi.string(),
    supplier: Joi.string(),
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
  getIngredients,
  getIngredient,
  deleteIngredient,
};

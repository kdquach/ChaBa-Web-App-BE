const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createIngredientCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
  }),
};

const updateIngredientCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string(),
      isActive: Joi.boolean(),
    })
    .min(1),
};

const getAllIngredientCategories = {
  query: Joi.object().keys({
    name: Joi.string(),
    isActive: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getIngredientCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId).required(),
  }),
};

const deleteIngredientCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createIngredientCategory,
  updateIngredientCategory,
  getAllIngredientCategories,
  getIngredientCategory,
  deleteIngredientCategory,
};

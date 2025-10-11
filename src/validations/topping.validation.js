const Joi = require("joi");
// const { objectId } = require("./custom.validation");

const createTopping = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    price: Joi.number().min(0).required(),
    isAvailable: Joi.boolean(),
  }),
};

const getToppings = {
  query: Joi.object().keys({
    name: Joi.string(),
    isAvailable: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  createTopping,
  getToppings,
};

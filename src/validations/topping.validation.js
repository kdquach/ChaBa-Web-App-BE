const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createTopping = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    price: Joi.number().min(0).required(),
    isAvailable: Joi.boolean(),
    image: Joi.string().allow(null, "").optional(),
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

const getTopping = {
  params: Joi.object().keys({
    // Sử dụng custom validation cho Mongo ObjectId
    id: Joi.string().custom(objectId).required(),
  }),
};

const updateTopping = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      price: Joi.number().min(0),
      isAvailable: Joi.boolean(),
      image: Joi.string().allow(null, "").optional(),
    })
    .min(1), // Đảm bảo phải có 1 trường được update
};

const deleteTopping = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createTopping,
  getToppings,
  getTopping,
  updateTopping,
  deleteTopping,
};

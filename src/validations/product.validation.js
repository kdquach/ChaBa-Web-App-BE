/* eslint-disable prettier/prettier */
const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    price: Joi.number().min(0).required(),
    image: Joi.string().uri().required(),
    categoryId: Joi.string().custom(objectId).required(),
    toppings: Joi.array().items(
      Joi.object().keys({
        _id: Joi.string().custom(objectId), // nếu client gửi _id thì validate
        name: Joi.string().required(),
        price: Joi.number().min(0).required(),
      })
    ),
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
      image: Joi.string().uri(),
      categoryId: Joi.string().custom(objectId),
      toppings: Joi.array().items(
        Joi.object().keys({
          _id: Joi.string().custom(objectId),
          name: Joi.string(),
          price: Joi.number().min(0),
        })
      ),
      recipe: Joi.array().items(
        Joi.object().keys({
          _id: Joi.string().custom(objectId),
          ingredientId: Joi.string().custom(objectId),
          quantity: Joi.number().min(1),
        })
      ),
    })
    .min(1), // ít nhất phải có 1 trường để update
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
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
};

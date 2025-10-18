const Joi = require("joi");
const { password, objectId } = require("./custom.validation");

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    addresses: Joi.array()
      .items(
        Joi.object({
          street: Joi.string().required(),
          ward: Joi.object({
            code: Joi.string().required(),
            name: Joi.string().required(),
          }).required(),
          district: Joi.object({
            code: Joi.string().required(),
            name: Joi.string().required(),
          }).required(),
          city: Joi.object({
            code: Joi.string().required(),
            name: Joi.string().required(),
          }).required(),
        })
      )
      .optional(),
    permissions: Joi.array().items(Joi.string()).allow(null).optional(),
    role: Joi.string().required().valid("user", "admin"),
    type: Joi.string().valid("staff", "user").optional(),
    status: Joi.string().valid("active", "inactive").optional(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string().valid("user", "admin", "staff").optional(),
    type: Joi.string().valid("staff", "user").optional(),
    status: Joi.string().valid("active", "inactive").optional(),
    search: Joi.string().allow("").optional(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
    })
    .min(1)
    .unknown(true),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
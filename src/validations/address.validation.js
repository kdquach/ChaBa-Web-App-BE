const Joi = require("joi");
const { objectId } = require("./custom.validation");

const addressSchema = Joi.object({
  street: Joi.string().required(),
  ward: Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
  })
    .unknown(true)
    .required(),
  district: Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
  })
    .unknown(true)
    .required(),
  city: Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
  })
    .unknown(true)
    .required(),
  isDefault: Joi.boolean().optional(),
});

const createAddress = {
  body: addressSchema,
};

const updateAddress = {
  params: Joi.object({
    addressId: Joi.string().custom(objectId).required(),
  }),
  body: addressSchema.min(1),
};

const deleteAddress = {
  params: Joi.object({
    addressId: Joi.string().custom(objectId).required(),
  }),
};

const getAddressById = {
  params: Joi.object({
    addressId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createAddress,
  updateAddress,
  deleteAddress,
  getAddressById,
};

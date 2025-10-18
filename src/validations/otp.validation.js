/* eslint-disable no-undef */
const Joi = require("joi");

const sendOTP = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
};

const verifyOTP = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    otp: Joi.string().required().length(6).pattern(/^\d+$/),
  }),
};

const registerWithOTP = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    otp: Joi.string().required().length(6).pattern(/^\d+$/),
  }),
};

const resetPasswordWithOTP = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    otp: Joi.string().required().length(6).pattern(/^\d+$/),
    password: Joi.string().required().custom(password),
  }),
};

module.exports = {
  sendOTP,
  verifyOTP,
  registerWithOTP,
  resetPasswordWithOTP,
};

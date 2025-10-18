const Joi = require("joi");
const { password } = require("./custom.validation");

const registerStep1 = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    phone: Joi.string().required(),
  }),
};

const registerStep2 = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    otp: Joi.string().required().length(6).pattern(/^\d+$/),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPasswordStep1 = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const forgotPasswordStep2 = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string().required().length(6).pattern(/^\d+$/),
  }),
};

const resetPasswordWithOTP = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const googleLogin = {
  body: Joi.object().keys({
    token: Joi.string().required().description("Google credential token"),
  }),
};

module.exports = {
  registerStep1,
  registerStep2,
  login,
  logout,
  refreshTokens,
  forgotPasswordStep1,
  forgotPasswordStep2,
  resetPasswordWithOTP,
  verifyEmail,
  googleLogin,
};

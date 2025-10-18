const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");
const tokenService = require("./token.service");
const userService = require("./user.service");
const Token = require("../models/token.model");
const ApiError = require("../utils/ApiError");
const { tokenTypes } = require("../config/tokens");
const User = require("../models/user.model");
const { verifyGoogleToken } = require("../utils/googleVerify");
const { verifyFacebookToken } = require("../utils/facebookVerify");
const otpService = require("./otp.service");

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(
      refreshToken,
      tokenTypes.REFRESH
    );
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      tokenTypes.RESET_PASSWORD
    );
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password reset failed");
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(
      verifyEmailToken,
      tokenTypes.VERIFY_EMAIL
    );
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Email verification failed");
  }
};

/**
 * Xử lý đăng nhập Google
 * @param {string} token - Google credential token từ FE
 * @returns {Promise<{ user: object, tokens: object }>}
 */
const googleLogin = async (token) => {
  try {
    const googleUser = await verifyGoogleToken(token);

    if (!googleUser?.email) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Google token");
    }

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        provider: "google",
        providerId: googleUser.googleId,
        isEmailVerified: googleUser.emailVerified || true,
        avatar: googleUser.picture,
      });
    } else if (user.provider === "local") {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Email đã được đăng ký bằng tài khoản thường."
      );
    }

    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      `Google authentication failed: ${error.message}`
    );
  }
};

/**
 * Facebook login
 * @param {string} token - Facebook access token from client
 */
const facebookLogin = async (token) => {
  try {
    const fbUser = await verifyFacebookToken(token);

    if (!fbUser?.email) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Facebook token");
    }

    let user = await User.findOne({ email: fbUser.email });

    if (!user) {
      user = await User.create({
        name: fbUser.name,
        email: fbUser.email,
        provider: "facebook",
        providerId: fbUser.facebookId,
        isEmailVerified: fbUser.emailVerified || true,
        avatar: fbUser.picture,
      });
    } else if (user.provider === "local") {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Email đã được đăng ký bằng tài khoản thường."
      );
    }

    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      `Facebook authentication failed: ${error.message}`
    );
  }
};

/**
 * Register user (Step 1: Send OTP)
 * @param {Object} userBody
 * @returns {Promise<void>}
 */
const registerStep1 = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email đã được sử dụng");
  }

  // Gửi OTP xác minh
  await otpService.createAndSendOTP(userBody.email, "REGISTER");
};

/**
 * Register user (Step 2: Verify OTP and create account)
 * @param {Object} userBody
 * @param {string} otp
 * @returns {Promise<User>}
 */
const registerStep2 = async (userBody, otp) => {
  // Xác minh OTP
  await otpService.verifyOTP(userBody.email, otp, "REGISTER");

  // Tạo user
  const user = await User.create({
    ...userBody,
    isEmailVerified: true, // Đã xác minh qua OTP
  });

  // Cleanup OTP
  await otpService.cleanupOTP(userBody.email, "REGISTER");

  return user;
};

/**
 * Forgot password (Step 1: Send OTP)
 * @param {string} email
 * @returns {Promise<void>}
 */
const forgotPasswordStep1 = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Không tìm thấy user với email này"
    );
  }

  // Gửi OTP reset password
  await otpService.createAndSendOTP(email, "FORGOT_PASSWORD");
};

/**
 * Forgot password (Step 2: Verify OTP)
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<boolean>}
 */
const forgotPasswordStep2 = async (email, otp) => {
  // eslint-disable-next-line no-return-await
  return await otpService.verifyOTP(email, otp, "FORGOT_PASSWORD");
};

/**
 * Reset password (Step 3: Set new password)
 * @param {string} email
 * @param {string} password
 * @returns {Promise<void>}
 */
const resetPasswordWithOTP = async (email, password) => {
  // Kiểm tra OTP đã được xác minh chưa
  const isVerified = await otpService.isOTPVerified(email, "FORGOT_PASSWORD");
  if (!isVerified) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Vui lòng xác minh OTP trước");
  }

  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User không tồn tại");
  }

  // Cập nhật password
  await userService.updateUserById(user.id, { password });

  // Cleanup OTP
  await otpService.cleanupOTP(email, "FORGOT_PASSWORD");

  // Revoke tất cả refresh tokens
  await Token.deleteMany({ user: user.id, type: tokenTypes.REFRESH });
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  googleLogin,
  resetPassword,
  verifyEmail,
  registerStep1,
  registerStep2,
  forgotPasswordStep1,
  forgotPasswordStep2,
  resetPasswordWithOTP,
  facebookLogin,
};

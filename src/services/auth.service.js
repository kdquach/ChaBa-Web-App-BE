const httpStatus = require("http-status");
const tokenService = require("./token.service");
const userService = require("./user.service");
const Token = require("../models/token.model");
const ApiError = require("../utils/ApiError");
const { tokenTypes } = require("../config/tokens");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { verifyGoogleToken } = require("../utils/googleVerify");

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
    console.log("🔍 authService.googleLogin started");

    const googleUser = await verifyGoogleToken(token);
    console.log("✅ Google user verified:", {
      email: googleUser.email,
      name: googleUser.name,
    });

    if (!googleUser?.email) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Google token");
    }

    let user = await User.findOne({ email: googleUser.email });
    console.log("🔍 Existing user found:", user ? "Yes" : "No");

    if (!user) {
      console.log("📝 Creating new user...");
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        provider: "google",
        providerId: googleUser.googleId,
        isEmailVerified: googleUser.emailVerified || true,
        avatar: googleUser.picture,
      });
      console.log("✅ New user created:", user._id);
    } else if (user.provider === "local") {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Email đã được đăng ký bằng tài khoản thường."
      );
    }

    console.log("👤 User before token generation:", {
      id: user.id,
      _id: user._id,
      email: user.email,
      name: user.name,
    });

    return user;
  } catch (error) {
    console.error("❌ Google login error:", error.message);

    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Google authentication failed: " + error.message
    );
  }
};
const changePassword = async (userId, body) => {
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Nếu là tài khoản social login hoặc chưa có mật khẩu nội bộ thì không cho đổi trực tiếp
  if (user.provider && user.provider !== "local") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Tài khoản đăng nhập bằng mạng xã hội chưa thiết lập mật khẩu. Vui lòng đặt mật khẩu trước."
    );
  }
  if (!user.password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Tài khoản chưa có mật khẩu nội bộ. Vui lòng đặt mật khẩu trước."
    );
  }

  const isMatch = await user.isPasswordMatch(body.currentPassword);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Mật khẩu hiện tại không đúng!");
  }

  if (body.currentPassword === body.newPassword) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Mật khẩu mới không được trùng với mật khẩu cũ"
    );
  }

  user.password = body.newPassword;
  await user.save();
  return user;
};
module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  googleLogin,
  changePassword,
  resetPassword,
  verifyEmail,
};

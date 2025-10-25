const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const {
  authService,
  userService,
  tokenService,
  emailService,
  otpService,
} = require("../services");

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send({ user });
});

const login = catchAsync(async (req, res) => {
  // eslint-disable-next-line no-console
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus[200]).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(
    req.body.email
  );
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(
    req.user
  );
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const googleLogin = catchAsync(async (req, res) => {
  const { token } = req.body;
  const user = await authService.googleLogin(token);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const changePassword = catchAsync(async (req, res) => {
  const userId = req.user.id;
  await authService.changePassword(userId, req.body);
  res.send({ message: "Đổi mật khẩu thành công" });
});

const facebookLogin = catchAsync(async (req, res) => {
  const { token } = req.body;
  const user = await authService.facebookLogin(token);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

/**
 * Register Step 1: Send OTP
 */
const registerStep1 = catchAsync(async (req, res) => {
  await authService.registerStep1(req.body);
  res.status(httpStatus.OK).send({
    message:
      "OTP đã được gửi đến email của bạn. Vui lòng kiểm tra và xác minh.",
  });
});

/**
 * Register Step 2: Verify OTP and create account
 */
const registerStep2 = catchAsync(async (req, res) => {
  const user = await authService.registerStep2(req.body, req.body.otp);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

/**
 * Forgot Password Step 1: Send OTP
 */
const forgotPasswordStep1 = catchAsync(async (req, res) => {
  await authService.forgotPasswordStep1(req.body.email);
  res.status(httpStatus.OK).send({
    message: "OTP đặt lại mật khẩu đã được gửi đến email của bạn.",
  });
});

/**
 * Forgot Password Step 2: Verify OTP
 */
const forgotPasswordStep2 = catchAsync(async (req, res) => {
  await authService.forgotPasswordStep2(req.body.email, req.body.otp);
  res.status(httpStatus.OK).send({
    message: "OTP đã được xác minh. Bạn có thể đặt lại mật khẩu.",
  });
});

/**
 * Reset password with OTP
 */
const resetPasswordWithOTP = catchAsync(async (req, res) => {
  await authService.resetPasswordWithOTP(req.body.email, req.body.password);
  res.status(httpStatus.OK).send({
    message: "Mật khẩu đã được đặt lại thành công.",
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  googleLogin,
  changePassword,
  registerStep1,
  registerStep2,
  forgotPasswordStep1,
  forgotPasswordStep2,
  resetPasswordWithOTP,
  facebookLogin,
};

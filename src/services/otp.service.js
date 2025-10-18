const crypto = require("crypto");
const moment = require("moment");
const httpStatus = require("http-status");
const { OTP } = require("../models");
const ApiError = require("../utils/ApiError");
const emailService = require("./email.service");

/**
 * Generate random 6-digit OTP
 * @returns {string}
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Create and send OTP
 * @param {string} email
 * @param {string} type - 'REGISTER' or 'FORGOT_PASSWORD'
 * @returns {Promise<void>}
 */
const createAndSendOTP = async (email, type) => {
  // Xóa OTP cũ chưa xác minh
  await OTP.deleteMany({ email, type, verified: false });

  // Tạo OTP mới
  const otp = generateOTP();
  const expiresAt = moment().add(10, "minutes").toDate(); // Hết hạn sau 10 phút

  await OTP.create({
    email,
    otp,
    type,
    expiresAt,
  });
  // eslint-disable-next-line no-console
  console.log(`Generated OTP for ${email} (${type}): ${otp}`); // Debug log

  // Gửi email
  if (type === "REGISTER") {
    await emailService.sendVerificationOTP(email, otp);
  } else if (type === "FORGOT_PASSWORD") {
    await emailService.sendResetPasswordOTP(email, otp);
  }
};

/**
 * Verify OTP
 * @param {string} email
 * @param {string} otp
 * @param {string} type
 * @returns {Promise<boolean>}
 */
const verifyOTP = async (email, otp, type) => {
  const otpDoc = await OTP.findOne({
    email,
    type,
    verified: false,
    expiresAt: { $gt: new Date() },
  });

  if (!otpDoc) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "OTP không tồn tại hoặc đã hết hạn"
    );
  }

  // Kiểm tra số lần thử
  if (otpDoc.attempts >= 5) {
    await OTP.deleteOne({ _id: otpDoc._id });
    throw new ApiError(
      httpStatus.TOO_MANY_REQUESTS,
      "Đã vượt quá số lần thử. Vui lòng yêu cầu OTP mới"
    );
  }

  // Tăng số lần thử
  otpDoc.attempts += 1;
  await otpDoc.save();

  // Kiểm tra OTP
  if (otpDoc.otp !== otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP không đúng");
  }

  // Đánh dấu đã xác minh
  otpDoc.verified = true;
  await otpDoc.save();

  return true;
};

/**
 * Check if OTP is verified
 * @param {string} email
 * @param {string} type
 * @returns {Promise<boolean>}
 */
const isOTPVerified = async (email, type) => {
  const otpDoc = await OTP.findOne({
    email,
    type,
    verified: true,
    expiresAt: { $gt: new Date() },
  });

  return !!otpDoc;
};

/**
 * Cleanup verified OTP
 * @param {string} email
 * @param {string} type
 * @returns {Promise<void>}
 */
const cleanupOTP = async (email, type) => {
  await OTP.deleteMany({ email, type });
};

module.exports = {
  createAndSendOTP,
  verifyOTP,
  isOTPVerified,
  cleanupOTP,
};

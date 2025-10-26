const nodemailer = require("nodemailer");
const config = require("../config/config");
const logger = require("../config/logger");

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== "test") {
  transport
    .verify()
    .then(() => logger.info("Connected to email server"))
    .catch(() =>
      logger.warn(
        "Unable to connect to email server. Make sure you have configured the SMTP options in .env"
      )
    );
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, content) => {
  const msg = { from: config.email.from, to, subject };

  // If content looks like HTML, send as html, otherwise send as plain text
  const isHtml = typeof content === "string" && /<[^>]+>/g.test(content);
  if (isHtml) {
    msg.html = content;
  } else {
    msg.text = content;
  }

  try {
    const info = await transport.sendMail(msg);
    // Log useful debug info so we can see if the message was accepted/rejected
    logger.info("Email sent", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });
    return info;
  } catch (err) {
    // Log the error so it's visible in application logs
    logger.error(`Error sending email to ${to}: ${err.message}`);
    throw err;
  }
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = "Reset password";
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = "Email Verification";
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send verification OTP email
 * @param {string} to
 * @param {string} otp
 * @returns {Promise}
 */
const sendVerificationOTP = async (to, otp) => {
  const subject = "Xác minh tài khoản - Mã OTP";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <!-- Logo -->
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://res.cloudinary.com/dct761sh6/image/upload/v1760692274/thetrois-logo_om0kdj.jpg" 
             alt="The Trois Milk Tea" 
             style="width: 120px; height: auto;" />
      </div>
      <h2 style="color: #333;">Xác minh tài khoản của bạn</h2>
      <p>Chào bạn,</p>
      <p>Vui lòng sử dụng mã OTP sau để xác minh tài khoản:</p>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
      </div>
      <p><strong>Lưu ý:</strong></p>
      <ul>
        <li>Mã OTP có hiệu lực trong 10 phút</li>
        <li>Không chia sẻ mã này với bất kỳ ai</li>
      </ul>
      <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
    </div>
  `;
  await sendEmail(to, subject, html);
};

/**
 * Send reset password OTP email
 * @param {string} to
 * @param {string} otp
 * @returns {Promise}
 */
const sendResetPasswordOTP = async (to, otp) => {
  const subject = "Đặt lại mật khẩu - Mã OTP";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <!-- Logo -->
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://res.cloudinary.com/dct761sh6/image/upload/v1760692274/thetrois-logo_om0kdj.jpg" 
             alt="The Trois Milk Tea" 
             style="width: 120px; height: auto;" />
      </div>
      <h2 style="color: #333;">Đặt lại mật khẩu</h2>
      <p>Chào bạn,</p>
      <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã OTP sau:</p>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="color: #dc3545; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
      </div>
      <p><strong>Lưu ý:</strong></p>
      <ul>
        <li>Mã OTP có hiệu lực trong 10 phút</li>
        <li>Không chia sẻ mã này với bất kỳ ai</li>
      </ul>
      <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
    </div>
  `;
  await sendEmail(to, subject, html);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendVerificationOTP,
  sendResetPasswordOTP,
};

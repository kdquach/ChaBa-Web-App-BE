const request = require("supertest");
const httpStatus = require("http-status");
const app = require("../../src/app");
const setupTestDB = require("../utils/setupTestDB");
const { OTP, User } = require("../../src/models");
const { insertUsers, userOne } = require("../fixtures/user.fixture");
const { emailService } = require("../../src/services");

setupTestDB();

describe("OTP integration tests", () => {
  beforeEach(() => {
    // Prevent actual emails from being sent during tests
    jest.spyOn(emailService.transport, "sendMail").mockResolvedValue();
  });

  describe("POST /v1/auth/register/send-otp", () => {
    test("should send OTP and create OTP doc", async () => {
      const payload = {
        email: "test@mail.com",
        name: "Test",
        password: "password1",
        phone: "0912345678",
      };

      const res = await request(app)
        .post("/v1/auth/register/send-otp")
        .send(payload)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty("message");

      const otpDoc = await OTP.findOne({ email: payload.email });
      expect(otpDoc).toBeDefined();
      expect(otpDoc.type).toBe("REGISTER");
      expect(otpDoc.verified).toBe(false);
    });

    test("should return 400 for invalid body", async () => {
      await request(app)
        .post("/v1/auth/register/send-otp")
        .send({})
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("POST /v1/auth/register/verify-otp", () => {
    test("should verify OTP and create user", async () => {
      const payload = {
        email: "verify@mail.com",
        name: "Verify",
        password: "password1",
        phone: "0912345678",
      };
      // create OTP first
      await request(app)
        .post("/v1/auth/register/send-otp")
        .send(payload)
        .expect(httpStatus.OK);
      const otpDoc = await OTP.findOne({
        email: payload.email,
        type: "REGISTER",
      });
      expect(otpDoc).toBeDefined();

      const verifyPayload = { ...payload, otp: otpDoc.otp };
      const res = await request(app)
        .post("/v1/auth/register/verify-otp")
        .send(verifyPayload)
        .expect(httpStatus.CREATED);

      // user created
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user.email).toBe(payload.email);
      // tokens returned
      expect(res.body.tokens).toHaveProperty("access");

      // OTP cleaned up
      const otpAfter = await OTP.findOne({
        email: payload.email,
        type: "REGISTER",
      });
      expect(otpAfter).toBeNull();
    });

    test("should return 400 for invalid otp", async () => {
      const payload = {
        email: "invalidotp@mail.com",
        name: "Invalid",
        password: "password1",
        phone: "0912345678",
      };
      await request(app)
        .post("/v1/auth/register/send-otp")
        .send(payload)
        .expect(httpStatus.OK);
      await request(app)
        .post("/v1/auth/register/verify-otp")
        .send({ ...payload, otp: "000000" })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("POST /v1/auth/forgot-password/send-otp", () => {
    test("should send reset OTP if user exists", async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post("/v1/auth/forgot-password/send-otp")
        .send({ email: userOne.email })
        .expect(httpStatus.OK);
      expect(res.body).toHaveProperty("message");

      const otpDoc = await OTP.findOne({
        email: userOne.email,
        type: "FORGOT_PASSWORD",
      });
      expect(otpDoc).toBeDefined();
      expect(otpDoc.verified).toBe(false);
    });

    test("should return 404 if user not found", async () => {
      await request(app)
        .post("/v1/auth/forgot-password/send-otp")
        .send({ email: "noexist@mail.com" })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe("POST /v1/auth/forgot-password/verify-otp", () => {
    test("should verify forgot-password otp", async () => {
      await insertUsers([userOne]);
      await request(app)
        .post("/v1/auth/forgot-password/send-otp")
        .send({ email: userOne.email })
        .expect(httpStatus.OK);

      const otpDoc = await OTP.findOne({
        email: userOne.email,
        type: "FORGOT_PASSWORD",
      });
      expect(otpDoc).toBeDefined();

      await request(app)
        .post("/v1/auth/forgot-password/verify-otp")
        .send({ email: userOne.email, otp: otpDoc.otp })
        .expect(httpStatus.OK);

      const updatedOtp = await OTP.findOne({
        email: userOne.email,
        type: "FORGOT_PASSWORD",
      });
      expect(updatedOtp.verified).toBe(true);
    });

    test("should return 400 for wrong otp", async () => {
      await insertUsers([userOne]);
      await request(app)
        .post("/v1/auth/forgot-password/send-otp")
        .send({ email: userOne.email })
        .expect(httpStatus.OK);

      await request(app)
        .post("/v1/auth/forgot-password/verify-otp")
        .send({ email: userOne.email, otp: "123123" })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("POST /v1/auth/reset-password/with-otp", () => {
    test("should reset password if otp verified", async () => {
      await insertUsers([userOne]);
      // trigger forgot otp and verify it
      await request(app)
        .post("/v1/auth/forgot-password/send-otp")
        .send({ email: userOne.email })
        .expect(httpStatus.OK);
      const otpDoc = await OTP.findOne({
        email: userOne.email,
        type: "FORGOT_PASSWORD",
      });
      // verify
      await request(app)
        .post("/v1/auth/forgot-password/verify-otp")
        .send({ email: userOne.email, otp: otpDoc.otp })
        .expect(httpStatus.OK);

      // now reset password with otp
      await request(app)
        .post("/v1/auth/reset-password/with-otp")
        .send({ email: userOne.email, password: "password2" })
        .expect(httpStatus.OK);

      const dbUser = await User.findById(userOne._id);
      // password updated
      const bcrypt = require("bcryptjs");
      const match = await bcrypt.compare("password2", dbUser.password);
      expect(match).toBe(true);
    });

    test("should return 401 if otp not verified", async () => {
      await insertUsers([userOne]);
      await request(app)
        .post("/v1/auth/reset-password/with-otp")
        .send({ email: userOne.email, password: "password2" })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});

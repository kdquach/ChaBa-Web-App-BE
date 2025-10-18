const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { toJSON, paginate } = require("./plugins");
const { roles } = require("../config/roles");

const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true, required: true }, // Đường, số nhà (user nhập)
  ward: {
    code: { type: String, required: true },
    name: { type: String, required: true },
  },
  district: {
    code: { type: String, required: true },
    name: { type: String, required: true },
  },
  city: {
    code: { type: String, required: true },
    name: { type: String, required: true },
  },
});

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },

    // ⚙️ thêm để hỗ trợ social login
    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    providerId: {
      type: String, // ID của tài khoản Google/Facebook
      default: null,
    },

    password: {
      type: String,
      trim: true,
      minlength: 8,
      validate(value) {
        // chỉ check nếu provider là local hoặc có password
        if (value && (!value.match(/\d/) || !value.match(/[a-zA-Z]/))) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
      private: true,
    },
    phone: {
      type: String,
      required: false, // ⚠️ không bắt buộc cho login bằng Google/Facebook
      trim: true,
      validate(value) {
        if (value && !validator.isMobilePhone(value, "vi-VN")) {
          throw new Error("Invalid phone number");
        }
      },
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    role: {
      type: String,
      enum: roles,
      default: "user",
    },
    type: {
      type: String,
      enum: ["staff", "user"],
      default: "user",
    },
    permissions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String, // ảnh Google/Facebook nếu có
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre("save", async function (next) {
  const user = this;

  // Chỉ hash password nếu password được modified và không phải null/undefined
  if (user.isModified("password") && user.password) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

/**
 * @typedef User
 */
const User = mongoose.model("users", userSchema);

module.exports = User;
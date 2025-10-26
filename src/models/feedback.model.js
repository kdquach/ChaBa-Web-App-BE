/* eslint-disable prettier/prettier */
const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const feedbackSchema = Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "reported"],
      default: "pending",
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Tạo Index cho hiệu suất truy vấn
feedbackSchema.index({ productId: 1, rating: -1 });

feedbackSchema.plugin(toJSON);
feedbackSchema.plugin(paginate);

const Feedback = model("Feedback", feedbackSchema);

module.exports = Feedback;

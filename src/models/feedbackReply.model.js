const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const feedbackReplySchema = Schema(
  {
    feedbackId: {
      // Liên kết đến Feedback gốc
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
      required: true,
    },
    userId: {
      // Người tạo Reply
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentId: {
      // FIELD QUAN TRỌNG: Liên kết đến Reply cha (tạo Threading)
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeedbackReply",
      default: null, // Reply cấp cao nhất sẽ là null
    },
    content: {
      type: String,
      required: true,
    },
    isStaffReply: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
// Expose timestamps for this model only
feedbackReplySchema.set('toJSON', {
  transform(doc, ret) {
    if (doc.createdAt) ret.createdAt = doc.createdAt;
    if (doc.updatedAt) ret.updatedAt = doc.updatedAt;
    return ret;
  },
});

feedbackReplySchema.plugin(toJSON);
feedbackReplySchema.plugin(paginate);

const FeedbackReply = model("FeedbackReply", feedbackReplySchema);

module.exports = FeedbackReply;

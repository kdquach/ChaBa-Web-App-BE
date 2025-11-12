/* eslint-disable */
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const FeedbackReply = require("../models/feedbackReply.model");
const Feedback = require("../models/feedback.model");

class FeedbackReplyService {
  static async addReply(feedbackId, replyBody, userId, userRole) {
    const { parentId } = replyBody; // Lấy content và parentId từ body

    // 1. Kiểm tra tồn tại Feedback gốc (Referential Integrity)
    // Lệnh này giờ nhận ID chính xác
    const feedbackExists = await Feedback.findById(feedbackId);
    if (!feedbackExists) {
      throw new ApiError(httpStatus.NOT_FOUND, "Feedback not found.");
    }

    // 2. Kiểm tra tồn tại Reply cha (nếu có parentId)
    if (parentId) {
      const parentReplyExists = await FeedbackReply.findById(parentId);
      if (!parentReplyExists) {
        throw new ApiError(httpStatus.NOT_FOUND, "Parent reply not found.");
      }
    }

  // 3. Xác định xem có phải Staff/Admin trả lời không (Dùng cho FE hiển thị icon)
  const isStaffReply = userRole === "admin" || userRole === "staff";

    // 4. Tạo Reply
    return FeedbackReply.create({
      ...replyBody,
      feedbackId,
      userId,
      isStaffReply,
    });
  }

  static async queryReplies(feedbackId, options) {
    // Luôn populate User để biết ai là người phản hồi
    options.populate = "userId parentId";

    // Lấy tất cả replies liên quan đến feedback gốc
    const filter = { feedbackId };

    const replies = await FeedbackReply.paginate(filter, options);
    // Lưu ý: Frontend sẽ chịu trách nhiệm sắp xếp theo cấu trúc cây (tree structure) dựa trên parentId
    return replies;
  }

  // * CẬP NHẬT PHẢN HỒI (Authorization: Chỉ Owner hoặc Admin)
  static async updateReply(replyId, updateBody, currentUserId, userRole) {
    const reply = await FeedbackReply.findById(replyId);
    if (!reply) {
      throw new ApiError(httpStatus.NOT_FOUND, "Reply not found.");
    }

    let isAuthorized = false;

    const isOwner = reply.userId.toString() === currentUserId.toString();
    const isAdmin = userRole === "admin";
    const isTargetReplyStaff = reply.isStaffReply;

    if (isOwner) {
      isAuthorized = true;
    } else if (isAdmin && isTargetReplyStaff) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Authorization failed. You can only edit your own replies or other staff replies (if you are Admin)."
      );
    }

    // Chỉ cho phép cập nhật content
    reply.content = updateBody.content;
    await reply.save();
    return reply;
  }

  /**
   * XÓA PHẢN HỒI (Authorization: Chỉ Owner hoặc Admin)
   */
  static async deleteReply(replyId, currentUserId, userRole) {
    const reply = await FeedbackReply.findById(replyId);
    if (!reply) {
      throw new ApiError(httpStatus.NOT_FOUND, "Reply not found.");
    }

    // 1. Authorization Check: Chỉ người tạo hoặc Admin được xóa
    const isOwner = reply.userId.toString() === currentUserId.toString();
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "User is not authorized to delete this reply."
      );
    }

    // TODO: Cần kiểm tra và xóa các replies con (nếu có) để giữ cho thread sạch

    await reply.remove();
    return reply;
  }
}

module.exports = FeedbackReplyService;

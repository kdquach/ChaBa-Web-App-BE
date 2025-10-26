/* eslint-disable */
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { productService, orderService } = require("./index");
const Feedback = require("../models/feedback.model");
const pick = require("../utils/pick");

class FeedbackService {
  static async createFeedback(feedbackBody, userId) {
    // 1. Kiểm tra tồn tại Product
    const { productId } = feedbackBody;

    const productExists = await productService.getProductById(productId);
    if (!productExists) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Product not found for feedback"
      );
    }

    // 2. Single Review (Kiểm tra xem đã đánh giá sản phẩm này TRƯỚC đây chưa)
    const alreadyReviewed = await Feedback.findOne({ userId, productId });
    if (alreadyReviewed) {
      // FIX: Thông báo lỗi phải rõ ràng hơn
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "User has already submitted a review for this product and cannot submit another."
      );
    }

    // 3. Business Rule: Must Purchase (Bắt buộc phải mua)
    // Đây là kiểm tra cuối cùng và quan trọng nhất.
    const hasPurchased = await orderService.checkIfUserPurchasedProduct(
      userId,
      productId
    );
    if (!hasPurchased) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "User can only review products they have purchased."
      );
    }

    const finalBody = {
      ...feedbackBody,
      userId,
      status: "approved", // Ghi đè: Mặc định hiển thị
      isVerifiedPurchase: hasPurchased, // Ghi đè: Xác nhận đã mua hàng
    };

    return Feedback.create(finalBody);
  }

  static async getAllFeedbacks(filter, options, userRole) {
    const finalFilter = { ...filter };

    // 1. Authorization Filter (Chỉ Admin mới thấy tất cả trạng thái)
    // Nếu không phải Admin/Manager, chỉ hiển thị trạng thái 'approved'
    if (userRole !== "admin") {
      // Nếu filter không chỉ định status, HOẶC nếu client cố gắng xem status khác,
      // chúng ta sẽ ép nó về 'approved' cho Customer.
      if (!finalFilter.status || finalFilter.status !== "approved") {
        finalFilter.status = "approved";
      }
    }

    options.populate = "userId,productId";
    const feedbacks = await Feedback.paginate(finalFilter, options);
    return feedbacks;
  }

  static async getFeedbackById(feedbackId) {
    return Feedback.findById(feedbackId).populate("userId productId");
  }

  static async updateFeedbackById(
    feedbackId,
    updateBody,
    currentUserId,
    currentRole
  ) {
    // Kiểm tra feedback tồn tại hay chưa
    const feedback = await this.getFeedbackById(feedbackId);
    if (!feedback) {
      throw new ApiError(httpStatus.NOT_FOUND, "Feedback not found");
    }

    // Lấy ID chủ sở hữu
    const ownerIdString = feedback.userId.id
      ? feedback.userId.id
      : feedback.userId.toString();

    // 1. Authorization Check: Kiểm tra quyền sửa
    if (ownerIdString !== currentUserId.toString() && currentRole !== "admin") {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "User is not authorized to edit this feedback."
      );
    }

    // 2. Chỉ cho phép sửa các trường được chọn
    let allowedUpdates = {};

    // Admin/Staff có quyền sửa nhiều trường hơn
    if (currentRole === "admin") {
      allowedUpdates = pick(updateBody, [
        "content",
        "rating",
        "status",
        "isVerifiedPurchase",
      ]);
    } else {
      // User thường chỉ được sửa content và rating (nếu được phép)
      allowedUpdates = pick(updateBody, ["content", "rating"]);
    }

    Object.assign(feedback, allowedUpdates);
    await feedback.save();
    return feedback;
  }

  static async deleteFeedbackById(feedbackId, currentUserId, currentRole) {
    // Kiểm tra feedback tồn tại hay chưa
    const feedback = await this.getFeedbackById(feedbackId);
    if (!feedback) {
      throw new ApiError(httpStatus.NOT_FOUND, "Feedback not found");
    }

    // Chỉ cho phép người tạo feedback hoặc nhân viên xóa
    if (
      feedback.userId.toString() !== currentUserId.toString() &&
      currentRole !== "admin"
    ) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "User is not authorized to delete this feedback"
      );
    }

    await feedback.remove();
    return feedback;
  }
}

module.exports = FeedbackService;

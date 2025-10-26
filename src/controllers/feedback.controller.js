const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const pick = require("../utils/pick");
const FeedbackService = require("../services/feedback.service");

class FeedbackController {
  constructor() {
    this.createFeedback = catchAsync(this.createFeedback.bind(this));
    this.getFeedbacks = catchAsync(this.getFeedbacks.bind(this));
    this.getFeedbackById = catchAsync(this.getFeedbackById.bind(this));
    this.updateFeedback = catchAsync(this.updateFeedback.bind(this));
    this.deleteFeedback = catchAsync(this.deleteFeedback.bind(this));
  }

  async createFeedback(req, res) {
    const userId = req.user.id; // Lấy ID từ token
    const feedback = await FeedbackService.createFeedback(req.body, userId);
    res.status(httpStatus.CREATED).send(feedback);
  }

  async getFeedbacks(req, res) {
    // Lấy role từ Mock Auth/Auth
    const userRole = req.user ? req.user.role : "guest"; // Nếu không auth, mặc định là guest/user

    const filter = pick(req.query, ["productId", "rating", "status"]);
    const options = pick(req.query, ["sortBy", "limit", "page"]);

    const result = await FeedbackService.getAllFeedbacks(
      filter,
      options,
      userRole
    );
    res.status(httpStatus.OK).send(result);
  }

  async getFeedbackById(req, res) {
    const feedback = await FeedbackService.getFeedbackById(
      req.params.feedbackId
    );

    res.status(httpStatus.OK).send(feedback);
  }

  async updateFeedback(req, res) {
    const userId = req.user.id;
    const userRole = req.user.role;
    const feedback = await FeedbackService.updateFeedbackById(
      req.params.feedbackId,
      req.body,
      userId,
      userRole
    );
    res.status(httpStatus.OK).send(feedback);
  }

  async deleteFeedback(req, res) {
    const userId = req.user.id;
    const userRole = req.user.role;
    await FeedbackService.deleteFeedbackById(
      req.params.feedbackId,
      userId,
      userRole
    );
    res.status(httpStatus.NO_CONTENT).send();
  }
}

module.exports = new FeedbackController();

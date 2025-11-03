/* eslint-disable */
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const FeedbackReplyService = require("../services/feedbackReply.service");
const pick = require("../utils/pick");

class FeedbackReplyController {
  constructor() {
    this.getReplies = catchAsync(this.getReplies.bind(this));
    this.addReply = catchAsync(this.addReply.bind(this));
    this.updateReply = catchAsync(this.updateReply.bind(this));
    this.deleteReply = catchAsync(this.deleteReply.bind(this));
  }

  async getReplies(req, res) {
    const feedbackId = req.params.feedbackId;
    const options = pick(req.query, ["sortBy", "limit", "page"]);

    const result = await FeedbackReplyService.queryReplies(feedbackId, options);
    res.status(httpStatus.OK).send(result);
  }

  async addReply(req, res) {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { feedbackId } = req.params.feedbackId;
    const reply = await FeedbackReplyService.addReply(
      feedbackId,
      req.body,
      userId,
      userRole
    );
    res.status(httpStatus.CREATED).send(reply);
  }

  async updateReply(req, res) {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { replyId } = req.params;
    const reply = await FeedbackReplyService.updateReply(
      replyId,
      req.body,
      userId,
      userRole
    );
    res.status(httpStatus.OK).send(reply);
  }

  async deleteReply(req, res) {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { replyId } = req.params;
    await FeedbackReplyService.deleteReply(replyId, userId, userRole);
    res.status(httpStatus.NO_CONTENT).send();
  }
}

module.exports = new FeedbackReplyController();

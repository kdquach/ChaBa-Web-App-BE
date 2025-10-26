/* src/routes/v1/feedback.route.js */
const express = require("express");
// const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const mockAuth = require("../../middlewares/mockupAuth");
const feedbackValidation = require("../../validations/feedback.validation");
const feedbackController = require("../../controllers/feedback.controller");
const feedbackReplyController = require("../../controllers/feedbackReply.controller");

const router = express.Router();

// * ----- FEEDBACK CRUD -----

router
  .route("/")
  .post(
    mockAuth("user"),
    // auth(),
    validate(feedbackValidation.createFeedback),
    feedbackController.createFeedback
  )
  .get(
    validate(feedbackValidation.getFeedbacks),
    feedbackController.getFeedbacks
  );

router
  .route("/:feedbackId")
  .get(
    // Validate ID nếu cần
    feedbackController.getFeedbackById // Tái sử dụng logic lấy chi tiết bằng cách thêm filter ID
  )
  .patch(
    mockAuth("user"),
    // auth(), // Chỉ người dùng đó hoặc Admin có quyền sửa (logic kiểm tra ở Service)
    validate(feedbackValidation.updateFeedback),
    feedbackController.updateFeedback
  )
  .delete(
    // auth(), // Chỉ người dùng đó hoặc Admin có quyền xóa
    feedbackController.deleteFeedback
  );

// * -----  REPLY CRUD -----

router.route("/:feedbackId/replies").post(
  mockAuth("admin user"),
  // auth(),
  validate(feedbackValidation.addReply),
  feedbackReplyController.addReply
);

router.route("/:feedbackId/replies/:replyId").patch(
  mockAuth("user"),
  // auth(), // Chỉ người dùng đó hoặc Admin có quyền sửa (nhưng admin không có quyền sửa reply user và ngược lại)
  validate(feedbackValidation.updateReply),
  feedbackReplyController.updateReply
);

router.route("/replies/:replyId").delete(
  mockAuth("user"),
  // auth(), // Chỉ người dùng đó hoặc Admin có quyền xóa
  validate(feedbackValidation.deleteReply),
  feedbackReplyController.deleteReply
);

module.exports = router;

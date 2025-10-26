const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createFeedback = {
  body: Joi.object().keys({
    productId: Joi.string().custom(objectId).required(),
    rating: Joi.number().min(1).max(5).required(),
    content: Joi.string().required(),
  }),
};

const getFeedbacks = {
  query: Joi.object().keys({
    productId: Joi.string().custom(objectId),
    rating: Joi.number().min(1).max(5),
    status: Joi.string().valid("approved", "rejected", "reported"),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateFeedback = {
  params: Joi.object().keys({
    feedbackId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      rating: Joi.number().min(1).max(5),
      content: Joi.string(),
      // Chỉ Admin/Staff được phép thay đổi Status
      status: Joi.string().valid("approved", "rejected", "reported").optional(),
    })
    .min(1),
};

// --- FEEDBACK REPLY CRUD (Nested Comments) ---

const addReply = {
  params: Joi.object().keys({
    feedbackId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    // userId (người tạo reply) được lấy từ token
    parentId: Joi.string().custom(objectId).allow(null), // Reply cho Reply khác (optional)
    content: Joi.string().required(),
  }),
};

const updateReply = {
  params: Joi.object().keys({
    feedbackId: Joi.string().custom(objectId).required(),
    replyId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      content: Joi.string().required(),
    })
    .min(1),
};

const deleteReply = {
  params: Joi.object().keys({
    replyId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createFeedback,
  getFeedbacks,
  updateFeedback,
  addReply,
  updateReply,
  deleteReply,
};

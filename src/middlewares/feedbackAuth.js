/* eslint-disable */
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const Feedback = require('../models/feedback.model');
const { checkIfUserPurchasedProduct } = require('../services/order.service');

// Ensure user purchased product before creating feedback
exports.requirePurchaseForFeedback = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const { productId } = req.body || {};
    if (!userId || !productId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Missing userId or productId');
    }
    const ok = await checkIfUserPurchasedProduct(userId, productId);
    if (!ok) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'User can only review products they have purchased.'
      );
    }
    return next();
  } catch (e) {
    return next(e);
  }
};

// Only owner of the feedback (or staff/admin) can reply as a USER role
// Staff/Admin can reply anywhere
exports.restrictReplyPermission = async (req, res, next) => {
  try {
    const role = req.user && req.user.role;
    if (role === 'admin' || role === 'staff') return next();

    const { feedbackId } = req.params;
    if (!feedbackId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Missing feedbackId');
    }
    const feedback = await Feedback.findById(feedbackId).select('userId');
    if (!feedback) throw new ApiError(httpStatus.NOT_FOUND, 'Feedback not found');

    const isOwner = String(feedback.userId) === String(req.user.id);
    if (!isOwner) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Only the feedback owner can reply as a user.'
      );
    }
    return next();
  } catch (e) {
    return next(e);
  }
};

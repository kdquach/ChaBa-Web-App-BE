const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const cartValidation = require("../../validations/cart.validation");
const cartController = require("../../controllers/cart.controller");

const router = express.Router();

/**
 * Thêm sản phẩm vào giỏ
 * Lấy giỏ hàng của user
 */
router
  .route("/")
  .get(auth("getCart"), cartController.getCart)
  .post(
    auth("manageCart"),
    validate(cartValidation.addToCart),
    cartController.addToCart
  )
  .delete(auth("manageCart"), cartController.clearCart);

/**
 * Cập nhật hoặc xóa từng item trong giỏ
 */
router
  .route("/:itemId")
  .patch(
    auth("manageCart"),
    validate(cartValidation.updateCartItem),
    cartController.updateCartItem
  )
  .delete(auth("manageCart"), cartController.removeCartItem);

module.exports = router;

const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const addressValidation = require("../../validations/address.validation");
const addressController = require("../../controllers/address.controller");

const router = express.Router();

router.route("/my").get(auth(), addressController.getMyAddresses);

router
  .route("/")
  .post(
    auth(),
    validate(addressValidation.createAddress),
    addressController.createAddress
  );

router
  .route("/:addressId")
  .get(
    auth(),
    validate(addressValidation.getAddressById),
    addressController.getAddressById
  )
  .patch(
    auth(),
    validate(addressValidation.updateAddress),
    addressController.updateAddress
  )
  .delete(
    auth(),
    validate(addressValidation.deleteAddress),
    addressController.deleteAddress
  );

module.exports = router;

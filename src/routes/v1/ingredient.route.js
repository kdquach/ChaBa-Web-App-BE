const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const ingredientValidation = require("../../validations/ingredient.validation");
const ingredientController = require("../../controllers/ingredient.controller");

const router = express.Router();

router
  .route("/")
  .get(
    auth("getIngredients"),
    validate(ingredientValidation.getIngredients),
    ingredientController.getIngredients
  );

module.exports = router;

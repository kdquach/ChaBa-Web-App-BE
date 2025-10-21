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
    validate(ingredientValidation.getAllIngredient),
    ingredientController.getAllIngredient
  )
  .post(
    auth("manageIngredients"),
    validate(ingredientValidation.createIngredient),
    ingredientController.createIngredient
  );

router
  .route("/:ingredientId")
  .get(
    auth("getIngredients"),
    validate(ingredientValidation.getIngredient),
    ingredientController.getIngredient
  )
  .patch(
    auth("manageIngredients"),
    validate(ingredientValidation.updateIngredient),
    ingredientController.updateIngredient
  )
  .delete(
    auth("manageIngredients"),
    validate(ingredientValidation.deleteIngredient),
    ingredientController.deleteIngredient
  );

module.exports = router;

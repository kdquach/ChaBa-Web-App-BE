const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const ingredientCategoryValidation = require("../../validations/ingredientCategory.validation");
const ingredientCategoryController = require("../../controllers/ingredientCategory.controller");

const router = express.Router();

// 🟢 Lấy danh sách chỉ có tên (cho select)
router.get(
  "/names",
  auth("getIngredientCategories"),
  ingredientCategoryController.getIngredientCategoryNames
);

router
  .route("/")
  .get(
    auth("getIngredientCategories"),
    validate(ingredientCategoryValidation.getAllIngredientCategories),
    ingredientCategoryController.getAllIngredientCategories
  )
  .post(
    auth("manageIngredientCategories"),
    validate(ingredientCategoryValidation.createIngredientCategory),
    ingredientCategoryController.createIngredientCategory
  );

router
  .route("/:categoryId")
  .get(
    auth("getIngredientCategories"),
    validate(ingredientCategoryValidation.getIngredientCategory),
    ingredientCategoryController.getIngredientCategory
  )
  .patch(
    auth("manageIngredientCategories"),
    validate(ingredientCategoryValidation.updateIngredientCategory),
    ingredientCategoryController.updateIngredientCategory
  )
  .delete(
    auth("manageIngredientCategories"),
    validate(ingredientCategoryValidation.deleteIngredientCategory),
    ingredientCategoryController.deleteIngredientCategory
  );

module.exports = router;

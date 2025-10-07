const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const categoryValidation = require("../../validations/productCategories.validation");
const categoryController = require("../../controllers/category.controller");

const router = express.Router();

router
  .route("/")
  .get(
    auth("getCategories"),
    validate(categoryValidation.getCategories),
    categoryController.getCategories
  );

module.exports = router;
/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Product categories
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort categories by a specific field
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit the number of categories returned
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */

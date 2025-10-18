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
    validate(categoryValidation.getProductCategories),
    categoryController.getCategories
  )
  .post(
    auth("manageCategories"),
    validate(categoryValidation.createProductCategories),
    categoryController.createCategory
  );

router
  .route("/:categoryId")
  .get(
    auth("getCategories"),
    validate(categoryValidation.getProductCategory),
    categoryController.getCategory
  )
  .patch(
    auth("manageCategories"),
    validate(categoryValidation.updateProductCategories),
    categoryController.updateCategory
  )
  .delete(
    auth("manageCategories"),
    validate(categoryValidation.deleteProductCategory),
    categoryController.deleteCategory
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

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 */

/**
 * @swagger
 * /categories/{categoryId}:
 *   get:
 *     summary: Get category by id
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     summary: Update category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: No content
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

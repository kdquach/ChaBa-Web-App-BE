/* eslint-disable */
/* prettier-ignore */
const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const toppingValidation = require("../../validations/topping.validation");
const toppingController = require("../../controllers/topping.controller");

const router = express.Router();

router
  .route("/")
  .post(
    // auth("manageProducts"),
    validate(toppingValidation.createTopping),
    toppingController.createTopping
  )
  .get(validate(toppingValidation.getToppings), toppingController.getToppings);

router
  .route("/:id")
  .get(validate(toppingValidation.getTopping), toppingController.getTopping)
  .patch(
    // auth("manageProducts"),
    validate(toppingValidation.updateTopping),
    toppingController.updateTopping
  )
  .delete(
    // auth("manageProducts"),
    validate(toppingValidation.deleteTopping),
    toppingController.deleteTopping
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Toppings
 *   description: Quản lý các loại Topping
 */

/**
 * @swagger
 * /toppings:
 *   post:
 *     summary: Thêm Topping mới
 *     description: Yêu cầu quyền 'manageProducts'.
 *     tags: [Toppings]
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
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Extra Cheese"
 *               price:
 *                 type: number
 *                 example: 15000
 *               isAvailable:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *     responses:
 *       "201":
 *         description: Topping đã được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topping'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEntry'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Lấy danh sách Toppings (Phân trang & Lọc)
 *     description: Lấy danh sách topping có phân trang và lọc.
 *     tags: [Toppings]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Tên topping (tìm kiếm một phần)
 *         example: "Cheese"
 *       - in: query
 *         name: isAvailable
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái
 *         example: true
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sắp xếp theo trường (e.g., createdAt:desc, name:asc)
 *         example: "createdAt:desc"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Số lượng kết quả trên mỗi trang
 *         example: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Số trang hiện tại
 *         example: 1
 *     responses:
 *       "200":
 *         description: Lấy danh sách topping thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Topping'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalResults:
 *                   type: integer
 *                   example: 50
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 */

/**
 * @swagger
 * /toppings/{toppingId}:
 *   get:
 *     summary: Lấy thông tin chi tiết Topping
 *     description: Lấy thông tin chi tiết của một topping theo ID
 *     tags: [Toppings]
 *     parameters:
 *       - in: path
 *         name: toppingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của topping
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       "200":
 *         description: Lấy thông tin topping thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topping'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Cập nhật Topping
 *     description: Yêu cầu quyền 'manageProducts'. Chỉ admin mới có thể cập nhật topping.
 *     tags: [Toppings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: toppingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của topping
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Extra Cheese"
 *               price:
 *                 type: number
 *                 example: 20000
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *           example:
 *             name: "Extra Cheese"
 *             price: 20000
 *             isAvailable: true
 *     responses:
 *       "200":
 *         description: Cập nhật topping thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topping'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEntry'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Xóa Topping
 *     description: Yêu cầu quyền 'manageProducts'. Chỉ admin mới có thể xóa topping.
 *     tags: [Toppings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: toppingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của topping
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       "204":
 *         description: Xóa topping thành công (No Content)
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

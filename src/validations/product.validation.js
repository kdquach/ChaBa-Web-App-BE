/* eslint-disable prettier/prettier */
const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required().messages({
      "any.required": "Tên sản phẩm là bắt buộc",
      "string.empty": "Tên sản phẩm không được để trống",
    }),

    price: Joi.number().min(0).required().messages({
      "any.required": "Giá sản phẩm là bắt buộc",
      "number.base": "Giá sản phẩm phải là số",
      "number.min": "Giá sản phẩm không được nhỏ hơn 0",
    }),

    categoryId: Joi.string().custom(objectId).required().messages({
      "any.required": "Danh mục là bắt buộc",
    }),

    status: Joi.string().valid("Đang bán", "Ngừng bán").default("Đang bán"),

    description: Joi.string().allow("", null),

    // ✅ ảnh có thể là đường dẫn hoặc file
    image: Joi.alternatives()
      .try(Joi.string(), Joi.object().unknown(true))
      .optional(),

    // ✅ toppings là danh sách ID topping
    toppings: Joi.array().items(Joi.string().custom(objectId)).optional(),

    // ✅ recipe gồm ingredientId + quantity
    recipe: Joi.array()
      .items(
        Joi.object({
          ingredientId: Joi.string().custom(objectId).required(),
          quantity: Joi.number().min(0).required(),
        })
      )
      .optional(),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().required().messages({
        "any.required": "Tên sản phẩm là bắt buộc",
        "string.empty": "Tên sản phẩm không được để trống",
      }),

      price: Joi.number().min(0).required().messages({
        "any.required": "Giá sản phẩm là bắt buộc",
        "number.base": "Giá sản phẩm phải là số",
        "number.min": "Giá sản phẩm không được nhỏ hơn 0",
      }),

      categoryId: Joi.string().custom(objectId).required().messages({
        "any.required": "Danh mục là bắt buộc",
      }),
      status: Joi.string().valid("Đang bán", "Ngừng bán"),
      description: Joi.string().allow("", null),

      // ✅ ảnh có thể là đường dẫn hoặc file
      image: Joi.alternatives()
        .try(Joi.string(), Joi.object().unknown(true))
        .optional(),

      // ✅ toppings là danh sách ID topping
      toppings: Joi.array().items(Joi.string().custom(objectId)).optional(),

      // ✅ recipe gồm ingredientId + quantity
      recipe: Joi.array()
        .items(
          Joi.object({
            ingredientId: Joi.string().custom(objectId).required(),
            quantity: Joi.number().min(0).required(),
          })
        )
        .optional(),
    })
    .min(1),
};

const getProducts = {
  params: Joi.object().keys({
    name: Joi.string(),
    category: Joi.string().custom(objectId),
    price: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId).required(),
  }),
};

const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
};

/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prettier/prettier */
const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

// Schema cho từng topping trong sản phẩm trong giỏ
const cartToppingSchema = mongoose.Schema(
  {
    toppingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topping",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { id: false }
);

// Schema cho từng item trong giỏ
const cartItemSchema = mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    toppings: {
      type: [cartToppingSchema],
      default: [],
    },
    customization: {
      ice: { type: Number, min: 0, max: 100 },
      sugar: { type: Number, min: 0, max: 100 },
      description: { type: String, trim: true },
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { id: true }
);

// Schema chính của Cart
const cartSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "checked_out"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "carts",
  }
);

// Plugin hỗ trợ JSON & phân trang
cartSchema.plugin(toJSON);
cartSchema.plugin(paginate);

// Hàm tính tổng giá giỏ hàng
cartSchema.methods.calculateTotal = async function () {
  let total = 0;

  for (const item of this.items) {
    const product = await mongoose.model("Product").findById(item.productId);

    if (!product) continue;

    let itemTotal = product.price * item.quantity;

    if (item.toppings && item.toppings.length > 0) {
      for (const t of item.toppings) {
        const topping = await mongoose.model("Topping").findById(t.toppingId);
        if (topping) {
          itemTotal += topping.price * (t.quantity || 1);
        }
      }
    }

    total += itemTotal;
  }

  this.totalPrice = total;
  return total;
};

// 🧠 Middleware: tự động tính totalPrice trước khi lưu (create, save)
cartSchema.pre("save", async function (next) {
  try {
    await this.calculateTotal();
    next();
  } catch (error) {
    next(error);
  }
});

// ⚙️ Middleware: tự động tính lại totalPrice khi cập nhật (findOneAndUpdate)
cartSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate();

    // Nếu có thay đổi items thì cần tính lại total
    if (update.items || update.$set?.items) {
      const docToUpdate = await this.model.findOne(this.getQuery());
      if (docToUpdate) {
        // Cập nhật items tạm thời để tính lại total
        if (update.items) docToUpdate.items = update.items;
        if (update.$set?.items) docToUpdate.items = update.$set.items;

        await docToUpdate.calculateTotal();
        update.totalPrice = docToUpdate.totalPrice;

        // Cập nhật lại vào query để lưu
        this.setUpdate(update);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;

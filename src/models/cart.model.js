/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prettier/prettier */
const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

// Schema cho từng topping được chọn trong CartItem
const cartToppingSchema = mongoose.Schema(
  {
    toppingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topping",
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

// Schema cho từng item trong giỏ hàng
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
      size: { type: String, enum: ["S", "M", "L"] },
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

// Schema chính của giỏ hàng
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
    // Lấy sản phẩm
    const product = await mongoose
      .model("Product")
      .findById(item.productId)
      .populate("toppings");

    if (!product) continue;

    // Giá cơ bản
    let itemTotal = product.price * item.quantity;

    // Lấy size
    const size = item.customization?.size;
    if (size === "M") itemTotal += 5000 * item.quantity;
    else if (size === "L") itemTotal += 10000 * item.quantity;

    // Cộng topping
    if (item.toppings && item.toppings.length > 0) {
      for (const t of item.toppings) {
        // t.toppingId có thể là ObjectId hoặc object
        let topping;
        if (typeof t.toppingId === "object" && t.toppingId.price) {
          topping = t.toppingId; // đã populate
        } else {
          topping = await mongoose.model("Topping").findById(t.toppingId);
        }

        if (!topping) continue;

        // Chỉ cộng nếu topping thuộc danh sách topping của product
        if (product.toppings.some((tp) => tp._id.equals(topping._id))) {
          itemTotal += topping.price * (t.quantity || 1);
        }
      }
    }

    total += itemTotal;
  }

  this.totalPrice = total;
  return total;
};

// Middleware: tự động tính lại tổng khi lưu (khi thêm mới hoặc cập nhật)
cartSchema.pre("save", async function (next) {
  try {
    await this.calculateTotal();
    next();
  } catch (err) {
    next(err);
  }
});

// Middleware: tự động tính lại tổng khi cập nhật
cartSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate();

    // Nếu có thay đổi items => cần tính lại tổng
    if (update.items || update.$set?.items) {
      const docToUpdate = await this.model.findOne(this.getQuery());
      if (docToUpdate) {
        if (update.items) docToUpdate.items = update.items;
        if (update.$set?.items) docToUpdate.items = update.$set.items;

        await docToUpdate.calculateTotal();
        update.totalPrice = docToUpdate.totalPrice;
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

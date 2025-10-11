const { Schema, model } = require("mongoose"); // Erase if already required
const { toJSON, paginate } = require("./plugins");

// Declare the Schema of the Mongo model
const toppingSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "toppings",
  }
);

// * Áp dụng các plugin
toppingSchema.plugin(toJSON);
toppingSchema.plugin(paginate);

// 👉 BỔ SUNG: Index duy nhất không phân biệt chữ hoa/thường (đáng tin cậy hơn unique: true)
// Xóa index cũ nếu có và thêm index này
toppingSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

/**
 * Static method để kiểm tra tên topping đã tồn tại chưa
 * @param {string} name - Tên topping
 * @param {ObjectId} [excludeToppingId] - Id của topping cần loại trừ (khi update)
 * @returns {Promise<boolean>}
 */
toppingSchema.statics.isNameTaken = async function (name, excludeToppingId) {
  // 👉 BỔ SUNG: Dùng Case-Insensitive Regex (Case-Insensitive Check)
  const trimmedName = name.trim();
  const topping = await this.findOne({
    name: { $regex: new RegExp(`^${trimmedName}$`, "i") }, // Tìm kiếm không phân biệt chữ hoa/thường
    _id: { $ne: excludeToppingId },
  });
  return !!topping; // Trả về true nếu document được tìm thấy, false nếu không.
};

// Export the model
module.exports = model("Topping", toppingSchema);

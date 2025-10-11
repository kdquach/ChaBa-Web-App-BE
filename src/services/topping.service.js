const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const Topping = require("../models/topping.model");

class ToppingService {
  static async createTopping(toppingBody) {
    // 1. Dùng tên biến rõ ràng hơn: isNameAlreadyTaken
    const existingTopping = await Topping.isNameTaken(toppingBody.name);

    // 2. SỬA LỖI LOGIC ĐẢO NGƯỢC:
    // Nếu existingTopping là TRUTHY (tên ĐÃ TỒN TẠI)
    if (existingTopping) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Topping name already taken");
    }

    // 3. Nếu tên CHƯA TỒN TẠI (existingTopping là null), tạo document mới
    const newTopping = await Topping.create(toppingBody);

    return newTopping;
  }

  static async getToppings(filter, options) {
    const toppings = await Topping.paginate(filter, options);
    return toppings;
  }

  static async getToppingById(id) {
    return Topping.findById(id);
  }

  static async updateToppingById(id, updateBody) {
    const topping = await this.getToppingById(id);

    if (!topping) {
      throw new ApiError(httpStatus.NOT_FOUND, "Topping not found");
    }

    if (updateBody.name && (await Topping.isNameTaken(updateBody.name, id))) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Topping name already token");
    }

    Object.assign(topping, updateBody);
    await topping.save();
    return topping;
  }
}

module.exports = ToppingService;

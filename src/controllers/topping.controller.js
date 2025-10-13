const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const ToppingService = require("../services/topping.service");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");

class ToppingController {
  constructor() {
    // Wrap và bind các method để dùng catchAsync mà không cần arrow fields
    this.createTopping = catchAsync(this.createTopping.bind(this));
    this.getToppings = catchAsync(this.getToppings.bind(this));
    this.getTopping = catchAsync(this.getTopping.bind(this));
    this.updateTopping = catchAsync(this.updateTopping.bind(this));
  }

  async createTopping(req, res) {
    const imageUrl = req.file ? req.file.path : null;

    const toppingData = {
      ...req.body,
      image: imageUrl,
    };

    const topping = await ToppingService.createTopping(toppingData);
    res.status(httpStatus.CREATED).send(topping);
  }

  async getToppings(req, res) {
    // Filter theo tên và trạng thái có sẵn (isAvailable)
    const filter = pick(req.query, ["name", "isAvailable"]);
    const options = pick(req.query, ["sortBy", "limit", "page"]);

    // Lọc theo tên sử dụng regex (nếu cần tìm kiếm một phần tên)
    if (filter.name) {
      filter.name = { $regex: filter.name, $options: "i" };
    }

    const result = await ToppingService.getToppings(filter, options);
    res.send(result);
  }

  async getTopping(req, res) {
    // SỬA LỖI: Gọi service bằng tên chuẩn và dùng req.params.id
    const topping = await ToppingService.getToppingById(req.params.id);

    if (!topping) {
      throw new ApiError(httpStatus.NOT_FOUND, "Topping not found");
    }

    res.status(httpStatus.OK).send(topping); // Thêm status 200 OK rõ ràng
  }

  async updateTopping(req, res) {
    const imageUrl = req.file ? req.file.path : null;

    const updateData = {
      ...req.body,
      ...(imageUrl && { image: imageUrl }),
    };

    const topping = await ToppingService.updateToppingById(
      req.params.id,
      updateData
    );
    res.status(httpStatus.OK).send(topping);
  }

  async deleteTopping(req, res) {
    await ToppingService.deleteToppingById(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
  }
}

module.exports = new ToppingController();

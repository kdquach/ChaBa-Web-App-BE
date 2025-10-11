const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const ToppingService = require("../services/topping.service");
const pick = require("../utils/pick");

class ToppingController {
  constructor() {
    // Wrap và bind các method để dùng catchAsync mà không cần arrow fields
    this.createTopping = catchAsync(this.createTopping.bind(this));
    this.getToppings = catchAsync(this.getToppings.bind(this));
  }

  async createTopping(req, res) {
    const topping = await ToppingService.createTopping(req.body);
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
}

module.exports = new ToppingController();

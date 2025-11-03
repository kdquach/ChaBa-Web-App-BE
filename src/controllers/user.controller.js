const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { userService } = require("../services");

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "role", "type", "status", "search"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  if (filter.search) {
    filter.$or = [
      { name: { $regex: filter.search, $options: "i" } },
      { email: { $regex: filter.search, $options: "i" } },
      { phone: { $regex: filter.search, $options: "i" } },
    ];
    delete filter.search; // xóa để tránh dùng nhầm sau này
  }
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const updateData = { ...req.body };
  if (req.body.addresses && typeof req.body.addresses === "string") {
    updateData.addresses = JSON.parse(req.body.addresses);
  }
  // Nếu có file upload thì thêm avatar, nếu không thì giữ nguyên
  if (req.file) {
    updateData.avatar = req.file.path;
  }

  const user = await userService.updateUserById(req.params.userId, updateData);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};

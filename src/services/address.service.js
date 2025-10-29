const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const User = require("../models/user.model");

/**
 * Lấy danh sách địa chỉ của user hiện tại
 */
const getMyAddresses = async (userId) => {
  const user = await User.findById(userId).select("addresses");
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  return user.addresses;
};

/**
 * Lấy chi tiết 1 địa chỉ theo ID
 */
const getAddressById = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  const address = user.addresses.id(addressId);
  if (!address) throw new ApiError(httpStatus.NOT_FOUND, "Address not found");
  return address;
};

/**
 * Thêm địa chỉ mới
 */
const createAddress = async (userId, addressBody) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  if (user.addresses.length >= 5) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Bạn chỉ được thêm tối đa 5 địa chỉ"
    );
  }

  if (user.addresses.length === 0) {
    addressBody.isDefault = true;
  }

  if (addressBody.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  user.addresses.push(addressBody);
  await user.save();
  return user.addresses[user.addresses.length - 1];
};

/**
 * Cập nhật địa chỉ
 */
const updateAddress = async (userId, addressId, updateBody) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  const address = user.addresses.id(addressId);
  if (!address) throw new ApiError(httpStatus.NOT_FOUND, "Address not found");

  if (updateBody.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
    address.isDefault = true;
  } else {
    if (address.isDefault) {
      const other = user.addresses.find(
        (addr) => addr._id.toString() !== addressId
      );
      if (other) other.isDefault = true;
      address.isDefault = false;
    }
  }
  Object.keys(updateBody).forEach((key) => {
    if (key !== "isDefault") address[key] = updateBody[key];
  });

  await user.save();
  return address;
};

/**
 * Xóa địa chỉ
 */
const deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  if (user.addresses.length <= 1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Bạn cần ít nhất một địa chỉ");
  }

  const address = user.addresses.id(addressId);
  if (!address) throw new ApiError(httpStatus.NOT_FOUND, "Address not found");

  const wasDefault = address.isDefault;
  // For mongoose subdocuments use remove() to delete the embedded document
  if (typeof address.remove === "function") {
    address.remove();
  } else if (typeof address.deleteOne === "function") {
    // fallback if available
    address.deleteOne();
  } else {
    // as a last resort, filter it out from the parent's array
    user.addresses = user.addresses.filter(
      (a) => String(a._id) !== String(address._id)
    );
  }
  await user.save();

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
    await user.save();
  }

  return addressId;
};

module.exports = {
  getMyAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
};

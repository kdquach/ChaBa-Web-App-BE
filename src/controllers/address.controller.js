const catchAsync = require("../utils/catchAsync");
const addressService = require("../services/address.service");

const getMyAddresses = catchAsync(async (req, res) => {
  const addresses = await addressService.getMyAddresses(req.user.id);
  res.send({ results: addresses });
});

const getAddressById = catchAsync(async (req, res) => {
  const address = await addressService.getAddressById(
    req.user.id,
    req.params.addressId
  );
  res.send(address);
});

const createAddress = catchAsync(async (req, res) => {
  const address = await addressService.createAddress(req.user.id, req.body);
  res.status(201).send(address);
});

const updateAddress = catchAsync(async (req, res) => {
  const address = await addressService.updateAddress(
    req.user.id,
    req.params.addressId,
    req.body
  );
  res.send(address);
});

const deleteAddress = catchAsync(async (req, res) => {
  await addressService.deleteAddress(req.user.id, req.params.addressId);
  res.status(200).send({ message: "Address deleted successfully" });
});

module.exports = {
  getMyAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
};

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message("Mật khẩu phai có ít nhất 8 ký tự");
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message(
      "Mật khẩu phải chứa ít nhất một chữ cái và một số"
    );
  }
  return value;
};

const phone = (value, helpers) => {
  if (!value.match(/^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5|8|9]|9[0-4|6-9])[0-9]{7}$/)) {
    return helpers.message("Số điện thoại không hợp lệ");
  }
  return value;
};

module.exports = {
  objectId,
  password,
  phone,
};

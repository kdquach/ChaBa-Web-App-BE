const allRoles = {
  user: [],
  admin: [
    "getUsers",
    "manageUsers",
    "manageProducts",
    "getProducts",
    "getCategories",
    "manageCategories",
    "getIngredients",
    "manageIngredients",
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};

const allRoles = {
  staff: [],
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
    "getIngredientCategories",
    "manageIngredientCategories",
    "getOrders",
    "manageOrders",
    "getCart",
    "manageCart",
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};

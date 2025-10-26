// ID của User và Admin đã được cung cấp (từ dữ liệu test)
const TEST_USER_ID = "66b2b2b2b2b2b2b2b2b2b2b2";
const TEST_ADMIN_ID = "66a1a1a1a1a1a1a1a1a1a1a1";

/**
 * Middleware mô phỏng đăng nhập thành công và gán req.user
 * @param {string} role - Vai trò muốn mô phỏng ('user' hoặc 'admin')
 */
const mockAuth =
  (role = "user") =>
  (req, res, next) => {
    // 1. Gán ID và Role hợp lệ
    req.user = {
      id: role === "admin" ? TEST_ADMIN_ID : TEST_USER_ID,
      role,
    };

    // 2. Chuyển sang Controller
    next();
  };

module.exports = mockAuth;

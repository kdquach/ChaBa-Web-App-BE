/* eslint-disable prettier/prettier */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-console */
const mongoose = require('mongoose');
const User = require('./models/user.model'); // đường dẫn tới file userSchema bạn đưa ở trên
const config = require('./config/config'); // chỗ bạn cấu hình MongoDB URL

async function seed() {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log('✅ Connected to MongoDB');

    // Xóa user cũ nếu tồn tại
    await User.deleteOne({ email: 'admin@example.com' });

    // Tạo admin mới
    const admin = new User({
      name: 'Super Admin',
      email: 'admin@example.com',
      password: 'admin12345', // plain password, middleware sẽ tự hash
      role: 'admin',
      isEmailVerified: true,
    });

    await admin.save();
    console.log('🎉 Admin user created successfully!');
    console.log('👉 Email: admin@example.com');
    console.log('👉 Password: admin12345');

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();

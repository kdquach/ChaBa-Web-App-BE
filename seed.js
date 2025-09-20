/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://kdquach03_db_user:12345@ac-dcn6uga.oiqfsq7.mongodb.net/ChaBaDB?retryWrites=true&w=majority';

// ================= SCHEMA =================
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  addresses: [
    {
      street: String,
      city: String,
      district: String,
      ward: String,
    },
  ],
});

const ProductCategorySchema = new mongoose.Schema({
  name: String,
});

const IngredientCategorySchema = new mongoose.Schema({
  name: String,
});

const IngredientSchema = new mongoose.Schema({
  name: String,
  unit: String,
  stock: Number,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'IngredientCategory' },
});

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' },
  toppings: [{ name: String, price: Number }],
  recipe: [{ ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }, quantity: Number }],
});

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      quantity: Number,
      price: Number,
      toppings: [{ name: String, price: Number }],
      customizations: {
        ice: String,
        sugar: String,
      },
    },
  ],
});

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Pending' },
  items: [Object], // giống cart items
  totalAmount: Number,
  payment: {
    method: String,
    status: String,
    transactionId: String,
  },
});

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  rating: Number,
  comment: String,
  replies: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      comment: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

// ================= MODEL =================
const User = mongoose.model('User', UserSchema);
const ProductCategory = mongoose.model('ProductCategory', ProductCategorySchema);
const IngredientCategory = mongoose.model('IngredientCategory', IngredientCategorySchema);
const Ingredient = mongoose.model('Ingredient', IngredientSchema);
const Product = mongoose.model('Product', ProductSchema);
const Cart = mongoose.model('Cart', CartSchema);
const Order = mongoose.model('Order', OrderSchema);
const Feedback = mongoose.model('Feedback', FeedbackSchema);

// ================= SEED FUNCTION =================
async function seed() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('✅ Connected to MongoDB');

  await mongoose.connection.db.dropDatabase();
  console.log('🗑️ Old database dropped');

  // Users
  const user = await User.create({
    name: 'Nguyen Van A',
    email: 'a@example.com',
    password: '123456',
    role: 'customer',
    addresses: [{ street: '123 Lê Lợi', city: 'HCM', district: '1', ward: 'Bến Nghé' }],
  });

  // Categories
  const catMilkTea = await ProductCategory.create({ name: 'Milk Tea' });
  const ingCatTea = await IngredientCategory.create({ name: 'Tea Base' });

  // Ingredients
  const ingTea = await Ingredient.create({ name: 'Black Tea', unit: 'gram', stock: 5000, categoryId: ingCatTea._id });
  const ingMilk = await Ingredient.create({ name: 'Milk Powder', unit: 'gram', stock: 3000, categoryId: ingCatTea._id });

  // Products
  const product = await Product.create({
    name: 'Classic Milk Tea',
    price: 35000,
    image: '/images/milktea.jpg',
    categoryId: catMilkTea._id,
    toppings: [
      { name: 'Pearl', price: 5000 },
      { name: 'Pudding', price: 7000 },
    ],
    recipe: [
      { ingredientId: ingTea._id, quantity: 5 },
      { ingredientId: ingMilk._id, quantity: 10 },
    ],
  });

  // Cart
  await Cart.create({
    userId: user._id,
    items: [
      {
        productId: product._id,
        name: product.name,
        quantity: 2,
        price: 35000,
        toppings: [{ name: 'Pearl', price: 5000 }],
        customizations: { ice: '50%', sugar: '70%' },
      },
    ],
  });

  // Order
  await Order.create({
    userId: user._id,
    status: 'Pending',
    items: [
      {
        productId: product._id,
        name: product.name,
        quantity: 2,
        price: 35000,
        toppings: [{ name: 'Pearl', price: 5000 }],
      },
    ],
    totalAmount: 80000,
    payment: { method: 'Cash', status: 'Unpaid' },
  });

  // Feedback
  await Feedback.create({
    userId: user._id,
    productId: product._id,
    rating: 5,
    comment: 'Rất ngon!',
    replies: [
      {
        userId: user._id, // có thể là admin/staff trả lời
        comment: 'Cảm ơn bạn đã ủng hộ!',
      },
    ],
  });

  console.log('🎉 Sample data inserted!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  mongoose.disconnect();
});

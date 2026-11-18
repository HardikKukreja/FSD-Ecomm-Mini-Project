import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce_db');
console.log('Connected. Clearing...');
await Promise.all([User.deleteMany(), Category.deleteMany(), Product.deleteMany(), Coupon.deleteMany()]);

// Use User.create() so the pre-save hook hashes the password properly
await User.create({ name: 'Admin', email: 'admin@shopsphere.com', password: 'Admin@123', role: 'admin' });
console.log('✓ Admin user created (password hashed by pre-save hook)');

const cats = await Category.insertMany([
  { name: 'Electronics', slug: 'electronics', description: 'Gadgets and devices', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' },
  { name: 'Clothing', slug: 'clothing', description: 'Fashion for all', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Home essentials', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400' },
  { name: 'Books', slug: 'books', description: 'Knowledge and stories', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400' },
  { name: 'Sports', slug: 'sports', description: 'Sports and fitness', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400' },
]);
console.log('✓ 5 categories');

await Product.insertMany([
  { title: 'iPhone 15 Pro', description: 'Latest Apple flagship with A17 Pro chip, titanium design, and advanced camera system.', price: 134900, discountPrice: 129900, category: cats[0]._id, images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'], stock: 50, sku: 'APPL-IP15P', brand: 'Apple', isFeatured: true },
  { title: 'Samsung Galaxy S24', description: 'Samsung flagship with Snapdragon 8 Gen 3 and AI features built-in.', price: 79999, discountPrice: 74999, category: cats[0]._id, images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600'], stock: 35, sku: 'SMSNG-S24', brand: 'Samsung', isFeatured: true },
  { title: 'Sony WH-1000XM5', description: 'Industry-leading noise cancelling headphones with 30-hour battery life.', price: 29990, discountPrice: 24990, category: cats[0]._id, images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600'], stock: 20, sku: 'SONY-WH5', brand: 'Sony', isFeatured: true },
  { title: 'MacBook Air M3', description: 'Incredibly thin and fast laptop with Apple M3 chip, 18-hour battery life.', price: 114900, discountPrice: 109900, category: cats[0]._id, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'], stock: 15, sku: 'APPL-MBA-M3', brand: 'Apple' },
  { title: 'Apple Watch Series 9', description: 'Advanced health tracking, ECG, blood oxygen sensor, and always-on display.', price: 41900, discountPrice: 38900, category: cats[0]._id, images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'], stock: 25, sku: 'APPL-WS9', brand: 'Apple' },
  { title: 'Fire HD 10 Tablet', description: '10.1 inch Full HD display, 32GB storage, 12-hour battery life.', price: 14999, discountPrice: 10999, category: cats[0]._id, images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'], stock: 45, sku: 'AMZN-HD10', brand: 'Amazon' },
  { title: 'Nike Air Max 270', description: 'Comfortable lifestyle shoe with large Air unit for all-day cushioning.', price: 12995, discountPrice: 9995, category: cats[1]._id, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'], stock: 100, sku: 'NIKE-AM270', brand: 'Nike', isFeatured: true },
  { title: "Levi's 511 Slim Jeans", description: 'Classic slim fit jeans crafted from stretch denim for everyday comfort.', price: 3999, discountPrice: 2999, category: cats[1]._id, images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'], stock: 80, sku: 'LEVI-511', brand: 'Levis' },
  { title: 'Adidas Ultraboost 22', description: 'Premium running shoe featuring responsive BOOST midsole technology.', price: 18000, discountPrice: 14400, category: cats[1]._id, images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600'], stock: 60, sku: 'ADID-UB22', brand: 'Adidas' },
  { title: 'Instant Pot Duo 7-in-1', description: 'Multi-use pressure cooker, slow cooker, rice cooker, steamer and more.', price: 8999, discountPrice: 6999, category: cats[2]._id, images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=600'], stock: 30, sku: 'INST-DUO7', brand: 'Instant Pot', isFeatured: true },
  { title: 'Dyson V15 Detect', description: 'Powerful cordless vacuum with laser dust detection and HD LCD screen.', price: 59900, discountPrice: 54900, category: cats[2]._id, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], stock: 10, sku: 'DYSO-V15', brand: 'Dyson' },
  { title: 'Nespresso Vertuo Next', description: 'Single-serve coffee maker with centrifusion extraction for rich espresso.', price: 14999, discountPrice: 12999, category: cats[2]._id, images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'], stock: 25, sku: 'NESP-VERT', brand: 'Nespresso' },
  { title: 'Ninja Air Fryer XL', description: '5.5-quart capacity, 7-in-1 functionality for healthy oil-free cooking.', price: 9999, discountPrice: 7499, category: cats[2]._id, images: ['https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=600'], stock: 35, sku: 'NINJ-AFR', brand: 'Ninja', isFeatured: true },
  { title: 'Atomic Habits', description: 'By James Clear — #1 New York Times bestseller on building good habits and breaking bad ones.', price: 599, discountPrice: 399, category: cats[3]._id, images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600'], stock: 200, sku: 'BOOK-ATOM', brand: 'Penguin', isFeatured: true },
  { title: 'The Psychology of Money', description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel.', price: 499, discountPrice: 349, category: cats[3]._id, images: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600'], stock: 150, sku: 'BOOK-PSYC', brand: 'Jaico' },
  { title: 'Deep Work', description: 'Rules for focused success in a distracted world by Cal Newport.', price: 549, discountPrice: 399, category: cats[3]._id, images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600'], stock: 120, sku: 'BOOK-DEEP', brand: 'Piatkus' },
  { title: 'Premium Yoga Mat', description: 'Non-slip 6mm thick eco-friendly yoga mat with carry strap and alignment lines.', price: 2499, discountPrice: 1799, category: cats[4]._id, images: ['https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600'], stock: 75, sku: 'SPRT-YOGA', brand: 'Liforme', isFeatured: true },
  { title: 'Resistance Bands Set', description: 'Set of 5 resistance bands for full body home or gym workout.', price: 1299, discountPrice: 899, category: cats[4]._id, images: ['https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=600'], stock: 90, sku: 'SPRT-RESI', brand: 'Boldfit' },
  { title: 'Whey Protein Gold Standard', description: '24g protein per serving, 5.5g BCAAs, available in multiple flavors.', price: 5999, discountPrice: 4499, category: cats[4]._id, images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600'], stock: 40, sku: 'SPRT-WHEY', brand: 'ON' },
  { title: 'Adjustable Dumbbell Set', description: '5-50 lbs adjustable dumbbells with rack, replaces 15 sets of weights.', price: 24999, discountPrice: 18999, category: cats[4]._id, images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600'], stock: 20, sku: 'SPRT-DUMB', brand: 'Bowflex' },
]);
console.log('✓ 20 products');

await Coupon.insertMany([
  { code: 'WELCOME10', type: 'percentage', value: 10, minCartValue: 500, expiryDate: new Date('2027-12-31'), usageLimit: 1000 },
  { code: 'FLAT200', type: 'flat', value: 200, minCartValue: 1000, expiryDate: new Date('2027-12-31'), usageLimit: 500 },
  { code: 'SALE25', type: 'percentage', value: 25, minCartValue: 2000, expiryDate: new Date('2027-06-30'), usageLimit: 100 },
]);
console.log('✓ 3 coupons');

console.log('\n✅ Seed complete! Login: admin@shopsphere.com / Admin@123');
await mongoose.disconnect();
process.exit(0);


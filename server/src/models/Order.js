import mongoose from 'mongoose';
const orderItemSchema = new mongoose.Schema({ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, qty: { type: Number, required: true, min: 1 }, priceAtPurchase: { type: Number, required: true } });
const shippingAddressSchema = new mongoose.Schema({ name: String, phone: String, street: String, city: String, state: String, zip: String, country: { type: String, default: 'India' } });
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentMethod: { type: String, default: 'mock' },
  orderStatus: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  couponUsed: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
}, { timestamps: true });
orderSchema.index({ user: 1, createdAt: -1 });
export default mongoose.model('Order', orderSchema);

import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [String],
  stock: { type: Number, required: true, min: 0, default: 0 },
  sku: { type: String, required: true, unique: true },
  brand: String,
  ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });
productSchema.index({ title: 'text', description: 'text' });
export default mongoose.model('Product', productSchema);

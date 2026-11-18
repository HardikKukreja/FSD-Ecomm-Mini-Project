import mongoose from 'mongoose';
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percentage', 'flat'], required: true },
  value: { type: Number, required: true, min: 0 },
  minCartValue: { type: Number, default: 0 },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number, required: true },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.model('Coupon', couponSchema);

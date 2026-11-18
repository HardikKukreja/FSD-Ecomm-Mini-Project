import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const addressSchema = new mongoose.Schema({ name: String, phone: String, street: String, city: String, state: String, zip: String, country: { type: String, default: 'India' } });
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  addresses: [addressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = async function(candidate) { return bcrypt.compare(candidate, this.password); };
userSchema.methods.toJSON = function() { const obj = this.toObject(); delete obj.password; return obj; };
export default mongoose.model('User', userSchema);

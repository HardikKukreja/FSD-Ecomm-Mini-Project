import Coupon from '../models/Coupon.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (coupon.expiryDate < new Date()) return res.status(400).json({ success: false, message: 'Coupon has expired' });
    if (coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    if (cartTotal < coupon.minCartValue) return res.status(400).json({ success: false, message: `Minimum cart value ₹${coupon.minCartValue} required` });
    const discount = Math.min(coupon.type === 'percentage' ? (cartTotal * coupon.value / 100) : coupon.value, cartTotal);
    res.json({ success: true, coupon, discount });
  } catch (err) { next(err); }
};

export const getCoupons = async (req, res, next) => {
  try { res.json({ success: true, coupons: await Coupon.find().sort({ createdAt: -1 }) }); } catch (err) { next(err); }
};

export const createCoupon = async (req, res, next) => {
  try { res.status(201).json({ success: true, coupon: await Coupon.create(req.body) }); } catch (err) { next(err); }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (err) { next(err); }
};

export const deleteCoupon = async (req, res, next) => {
  try { await Coupon.findByIdAndDelete(req.params.id); res.json({ success: true, message: 'Coupon deleted' }); } catch (err) { next(err); }
};


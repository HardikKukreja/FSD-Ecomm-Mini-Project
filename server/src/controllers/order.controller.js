import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import { emitToAdmins, emitToUser, emitStockUpdate, emitLowStock } from '../sockets/index.js';
import { sendOrderConfirmation, sendOrderStatusUpdate } from '../utils/email.js';

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, couponCode } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'No items provided' });

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const p = await Product.findById(item.productId);
      if (!p) return res.status(404).json({ success: false, message: `Product not found` });
      if (p.stock < item.qty) return res.status(400).json({ success: false, message: `Insufficient stock for ${p.title}` });
      const price = p.discountPrice || p.price;
      subtotal += price * item.qty;
      orderItems.push({ product: p._id, qty: item.qty, priceAtPurchase: price });
    }

    let discount = 0, couponUsed = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.expiryDate > new Date() && coupon.usedCount < coupon.usageLimit && subtotal >= coupon.minCartValue) {
        couponUsed = coupon._id;
        discount = coupon.type === 'percentage' ? (subtotal * coupon.value / 100) : coupon.value;
        discount = Math.min(discount, subtotal);
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
      }
    }

    const order = await Order.create({
      user: req.user._id, items: orderItems, shippingAddress,
      subtotal, discount, total: subtotal - discount,
      couponUsed, paymentStatus: 'paid', paymentMethod: 'mock',
    });

    for (const item of orderItems) {
      const p = await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } }, { new: true });
      emitStockUpdate(p._id, p.stock);
      if (p.stock < 5) emitLowStock(p);
    }

    await Cart.findOneAndDelete({ user: req.user._id });
    const populated = await Order.findById(order._id).populate('items.product user');
    emitToAdmins('newOrder', populated);
    await sendOrderConfirmation(order, req.user);
    res.status(201).json({ success: true, order });
  } catch (err) { next(err); }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('items.product', 'title images price discountPrice');
    res.json({ success: true, orders });
  } catch (err) { next(err); }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { orderStatus: status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
        .populate('user', 'name email').populate('items.product', 'title images price'),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, orders, total, totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus }, { new: true }).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    emitToUser(order.user._id, 'orderStatusUpdated', { orderId: order._id, status: orderStatus });
    await sendOrderStatusUpdate(order, order.user);
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'title images price discountPrice')
      .populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    res.json({ success: true, order });
  } catch (err) { next(err); }
};


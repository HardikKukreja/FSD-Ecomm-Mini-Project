import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    res.json({ success: true, cart: cart || { items: [] } });
  } catch (err) { next(err); }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, qty = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < qty) return res.status(400).json({ success: false, message: 'Insufficient stock' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existing = cart.items.find(i => i.product.toString() === productId);
    if (existing) existing.qty += qty;
    else cart.items.push({ product: productId, qty });

    await cart.save();
    await cart.populate('items.product');
    res.json({ success: true, cart });
  } catch (err) { next(err); }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { qty } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (qty <= 0) cart.items.pull(req.params.itemId);
    else item.qty = qty;
    await cart.save();
    await cart.populate('items.product');
    res.json({ success: true, cart });
  } catch (err) { next(err); }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items.pull(req.params.itemId);
    await cart.save();
    res.json({ success: true, message: 'Item removed' });
  } catch (err) { next(err); }
};

export const clearCart = async (req, res, next) => {
  try { await Cart.findOneAndDelete({ user: req.user._id }); res.json({ success: true, message: 'Cart cleared' }); } catch (err) { next(err); }
};


import Product from '../models/Product.js';
import { emitStockUpdate, emitLowStock } from '../sockets/index.js';

export const getProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12, isFeatured } = req.query;
    const filter = {};
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (isFeatured === 'true') filter.isFeatured = true;

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
      rating: { ratingAvg: -1 },
    };
    const skip = (Number(page) - 1) * Number(limit);
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sortMap[sort] || { createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('category', 'name slug'),
      Product.countDocuments(filter),
    ]);
    res.json({
      success: true,
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
      page: Number(page),
    });
  } catch (err) { next(err); }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) { next(err); }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) { next(err); }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < 5) emitLowStock(product);
    emitStockUpdate(product._id, product.stock);
    res.json({ success: true, product });
  } catch (err) { next(err); }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    emitStockUpdate(product._id, 0);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
};


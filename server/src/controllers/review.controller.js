import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find({ product: req.params.productId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('user', 'name'),
      Review.countDocuments({ product: req.params.productId }),
    ]);
    res.json({ success: true, reviews, total, totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
};

export const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;
    const verified = await Order.findOne({ user: req.user._id, orderStatus: 'delivered', 'items.product': productId });
    const review = await Review.findOneAndUpdate(
      { product: productId, user: req.user._id },
      { rating, comment, verifiedPurchase: !!verified },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    const stats = await Review.aggregate([
      { $match: { product: review.product } },
      { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length) {
      await Product.findByIdAndUpdate(productId, { ratingAvg: Math.round(stats[0].avg * 10) / 10, ratingCount: stats[0].count });
    }
    res.status(201).json({ success: true, review });
  } catch (err) { next(err); }
};


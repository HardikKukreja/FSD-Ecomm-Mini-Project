import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export const getStats = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [totalOrders, totalProducts, totalCustomers, revenueByDay, revTotal, topProducts, ordersByStatus, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.product', totalRevenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.qty'] } }, totalSold: { $sum: '$items.qty' } } },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
      ]),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email'),
    ]);
    res.json({
      success: true,
      stats: {
        totalRevenue: revTotal[0]?.total || 0,
        totalOrders, totalProducts, totalCustomers,
        revenueByDay, topProducts, ordersByStatus, recentOrders,
      },
    });
  } catch (err) { next(err); }
};


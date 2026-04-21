const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

const getDashboardStats = async (req, res) => {
  try {
    const [userCount, orderCount, productCount, revenueData] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { status: 'Delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    const activeOrders = await Order.countDocuments({ 
      status: { $in: ['Placed', 'Accepted', 'Out for Delivery'] } 
    });

    res.json({
      totalUsers: userCount,
      totalOrders: orderCount,
      totalProducts: productCount,
      totalRevenue: revenueData[0] ? revenueData[0].total : 0,
      activeOrders: activeOrders
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

module.exports = {
  getDashboardStats
};

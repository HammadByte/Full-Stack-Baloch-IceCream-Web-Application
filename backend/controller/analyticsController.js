import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import MenuItem from '../models/Menuitem.js';
import AppError from '../utils/AppError.js';

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
export const getSalesAnalytics = async (req, res, next) => {
    try {
        const { period = 'week' } = req.query; // week, month, year
        
        let startDate = new Date();
        
        switch (period) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        // Get orders in the period
        const orders = await Order.find({
            createdAt: { $gte: startDate },
            status: 'completed'
        }).populate('items.menuItem', 'name category price');

        // Calculate analytics
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalOrders = orders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Revenue by day
        const revenueByDay = {};
        orders.forEach(order => {
            const date = order.createdAt.toISOString().split('T')[0];
            revenueByDay[date] = (revenueByDay[date] || 0) + order.totalAmount;
        });

        // Popular categories
        const categoryRevenue = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                const category = item.menuItem.category;
                const revenue = item.price * item.quantity;
                categoryRevenue[category] = (categoryRevenue[category] || 0) + revenue;
            });
        });

        // Popular items
        const itemSales = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                const itemName = item.menuItem.name;
                itemSales[itemName] = {
                    quantity: (itemSales[itemName]?.quantity || 0) + item.quantity,
                    revenue: (itemSales[itemName]?.revenue || 0) + (item.price * item.quantity)
                };
            });
        });

        const popularItems = Object.entries(itemSales)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        res.status(200).json({
            success: true,
            data: {
                period,
                summary: {
                    totalRevenue,
                    totalOrders,
                    averageOrderValue
                },
                revenueByDay,
                categoryRevenue,
                popularItems,
                orderTypeBreakdown: {
                    'dine-in': orders.filter(o => o.orderType === 'dine-in').length,
                    'takeaway': orders.filter(o => o.orderType === 'takeaway').length,
                    'delivery': orders.filter(o => o.orderType === 'delivery').length
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get customer analytics
// @route   GET /api/analytics/customers
export const getCustomerAnalytics = async (req, res, next) => {
    try {
        const totalCustomers = await Customer.countDocuments();
        
        // New customers this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const newCustomersThisMonth = await Customer.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        // Top customers by spending
        const topCustomers = await Customer.find()
            .sort({ totalSpent: -1 })
            .limit(10)
            .select('name phone totalOrders totalSpent createdAt');

        // Customer growth data
        const customerGrowth = await Customer.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalCustomers,
                newCustomersThisMonth,
                topCustomers,
                customerGrowth
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get inventory analytics
// @route   GET /api/analytics/inventory
export const getInventoryAnalytics = async (req, res, next) => {
    try {
        const totalItems = await MenuItem.countDocuments();
        const availableItems = await MenuItem.countDocuments({ isAvailable: true });
        const unavailableItems = await MenuItem.countDocuments({ isAvailable: false });

        // Items by category
        const itemsByCategory = await MenuItem.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    available: {
                        $sum: { $cond: ['$isAvailable', 1, 0] }
                    }
                }
            }
        ]);

        // Price range analysis
        const priceStats = await MenuItem.aggregate([
            {
                $group: {
                    _id: null,
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalItems,
                    availableItems,
                    unavailableItems,
                    availabilityRate: (availableItems / totalItems * 100).toFixed(2)
                },
                itemsByCategory,
                priceStats: priceStats[0] || {}
            }
        });

    } catch (error) {
        next(error);
    }
};
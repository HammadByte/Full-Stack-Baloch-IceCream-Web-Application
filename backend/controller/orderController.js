import Order from '../models/Order.js';
import MenuItem from '../models/Menuitem.js';
import Customer from '../models/Customer.js';
import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

// @desc    Create new order
// @route   POST /api/orders
export const createOrder = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            return next(new AppError(errorMessages.join(', '), 400));
        }

        const { customer, items, orderType, paymentMethod, specialInstructions } = req.body;

        // Calculate total amount and validate items
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItem);
            
            if (!menuItem) {
                return next(new AppError(`Menu item not found: ${item.menuItem}`, 404));
            }

            if (!menuItem.isAvailable) {
                return next(new AppError(`${menuItem.name} is currently unavailable`, 400));
            }

            const itemTotal = menuItem.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                menuItem: item.menuItem,
                quantity: item.quantity,
                price: menuItem.price,
                specialInstructions: item.specialInstructions || ''
            });
        }

        // Create or update customer
        let customerDoc = await Customer.findOne({ phone: customer.phone });
        
        if (!customerDoc) {
            customerDoc = await Customer.create({
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                address: customer.address
            });
        } else {
            // Update customer order count
            customerDoc.totalOrders += 1;
            customerDoc.totalSpent += totalAmount;
            await customerDoc.save();
        }

        // Create order
        const order = await Order.create({
            customer: {
                name: customer.name,
                phone: customer.phone,
                address: customer.address
            },
            items: orderItems,
            totalAmount,
            orderType,
            paymentMethod,
            specialInstructions
        });

        // Populate order with menu item details
        const populatedOrder = await Order.findById(order._id)
            .populate('items.menuItem', 'name description price category image');

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: populatedOrder
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders with filtering
// @route   GET /api/orders
export const getOrders = async (req, res, next) => {
    try {
        const { status, orderType, date, page = 1, limit = 10 } = req.query;
        
        // Build filter object
        let filter = {};
        if (status) filter.status = status;
        if (orderType) filter.orderType = orderType;
        
        // Date filter
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            filter.createdAt = { $gte: startDate, $lt: endDate };
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query with pagination
        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('items.menuItem', 'name description price category')
                .populate('assignedTo', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Order.countDocuments(filter)
        ]);

        // Pagination result
        const pagination = {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        };

        res.status(200).json({
            success: true,
            count: orders.length,
            pagination,
            data: orders
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
export const getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.menuItem', 'name description price category image')
            .populate('assignedTo', 'name email');

        if (!order) {
            return next(new AppError('Order not found', 404));
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status, assignedTo } = req.body;
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return next(new AppError('Order not found', 404));
        }

        // Update order
        order.status = status;
        if (assignedTo) order.assignedTo = assignedTo;
        if (status === 'completed') order.completedAt = new Date();

        await order.save();

        const populatedOrder = await Order.findById(order._id)
            .populate('items.menuItem', 'name description price category')
            .populate('assignedTo', 'name');

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: populatedOrder
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Assign order to staff
// @route   PUT /api/orders/:id/assign
export const assignOrder = async (req, res, next) => {
    try {
        const { assignedTo } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { assignedTo },
            { new: true, runValidators: true }
        ).populate('items.menuItem', 'name price category')
         .populate('assignedTo', 'name email');

        if (!order) {
            return next(new AppError('Order not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Order assigned successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get today's orders and stats
// @route   GET /api/orders/today/stats
export const getTodayStats = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayOrders = await Order.find({
            createdAt: { $gte: today, $lt: tomorrow }
        }).populate('items.menuItem', 'name price');

        // Calculate statistics
        const totalRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalOrders = todayOrders.length;
        
        const statusCounts = {
            pending: todayOrders.filter(order => order.status === 'pending').length,
            confirmed: todayOrders.filter(order => order.status === 'confirmed').length,
            preparing: todayOrders.filter(order => order.status === 'preparing').length,
            ready: todayOrders.filter(order => order.status === 'ready').length,
            completed: todayOrders.filter(order => order.status === 'completed').length,
            cancelled: todayOrders.filter(order => order.status === 'cancelled').length
        };

        const orderTypeCounts = {
            'dine-in': todayOrders.filter(order => order.orderType === 'dine-in').length,
            'takeaway': todayOrders.filter(order => order.orderType === 'takeaway').length,
            'delivery': todayOrders.filter(order => order.orderType === 'delivery').length
        };

        // Popular items
        const itemCounts = {};
        todayOrders.forEach(order => {
            order.items.forEach(item => {
                const itemName = item.menuItem.name;
                itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
            });
        });

        const popularItems = Object.entries(itemCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalRevenue,
                    totalOrders,
                    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
                },
                statusCounts,
                orderTypeCounts,
                popularItems,
                recentOrders: todayOrders.slice(0, 10) // Last 10 orders
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
export const cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return next(new AppError('Order not found', 404));
        }

        if (order.status === 'completed') {
            return next(new AppError('Cannot cancel a completed order', 400));
        }

        order.status = 'cancelled';
        order.paymentStatus = 'refunded';
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};
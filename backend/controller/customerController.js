import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import AppError from '../utils/AppError.js';

// @desc    Get all customers
// @route   GET /api/customers
export const getCustomers = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10, sort = '-createdAt' } = req.query;

        // Build filter object
        let filter = {};
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query with pagination
        const [customers, total] = await Promise.all([
            Customer.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limitNum),
            Customer.countDocuments(filter)
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
            count: customers.length,
            pagination,
            data: customers
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
export const getCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id)
            .populate('favoriteItems', 'name description price category');

        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }

        res.status(200).json({
            success: true,
            data: customer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get customer orders
// @route   GET /api/customers/:id/orders
export const getCustomerOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        // Find customer first
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get customer orders by phone number
        const [orders, total] = await Promise.all([
            Order.find({ 'customer.phone': customer.phone })
                .populate('items.menuItem', 'name price category')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Order.countDocuments({ 'customer.phone': customer.phone })
        ]);

        // Calculate customer statistics
        const customerStats = {
            totalOrders: customer.totalOrders,
            totalSpent: customer.totalSpent,
            averageOrderValue: customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0
        };

        // Pagination result
        const pagination = {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        };

        res.status(200).json({
            success: true,
            data: {
                customer: customer,
                stats: customerStats,
                orders: {
                    data: orders,
                    pagination
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
export const updateCustomer = async (req, res, next) => {
    try {
        const { name, email, address, preferences } = req.body;

        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            { 
                name, 
                email, 
                address,
                preferences 
            },
            { 
                new: true, 
                runValidators: true 
            }
        ).populate('favoriteItems', 'name description price');

        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Customer updated successfully',
            data: customer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add favorite item for customer
// @route   POST /api/customers/:id/favorites
export const addFavoriteItem = async (req, res, next) => {
    try {
        const { menuItemId } = req.body;

        const customer = await Customer.findById(req.params.id);
        
        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }

        // Check if already in favorites
        if (customer.favoriteItems.includes(menuItemId)) {
            return next(new AppError('Item already in favorites', 400));
        }

        // Add to favorites
        customer.favoriteItems.push(menuItemId);
        await customer.save();

        await customer.populate('favoriteItems', 'name description price category');

        res.status(200).json({
            success: true,
            message: 'Item added to favorites',
            data: customer.favoriteItems
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove favorite item
// @route   DELETE /api/customers/:id/favorites/:itemId
export const removeFavoriteItem = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id);
        
        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }

        // Remove from favorites
        customer.favoriteItems = customer.favoriteItems.filter(
            itemId => itemId.toString() !== req.params.itemId
        );

        await customer.save();
        await customer.populate('favoriteItems', 'name description price category');

        res.status(200).json({
            success: true,
            message: 'Item removed from favorites',
            data: customer.favoriteItems
        });
    } catch (error) {
        next(error);
    }
};
import MenuItem from '../models/Menuitem.js';
import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

// @desc    Get all menu items with filtering and pagination
// @route   GET /api/menu
export const getMenuItems = async (req, res, next) => {
    try {
        const { 
            category, 
            available, 
            search, 
            page = 1, 
            limit = 10,
            sort = 'name'
        } = req.query;

        // Build filter object
        let filter = {};
        
        if (category) filter.category = category;
        if (available !== undefined) filter.isAvailable = available === 'true';
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query with pagination
        const [menuItems, total] = await Promise.all([
            MenuItem.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limitNum),
            MenuItem.countDocuments(filter)
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
            count: menuItems.length,
            pagination,
            data: menuItems
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
export const getMenuItem = async (req, res, next) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        
        if (!menuItem) {
            return next(new AppError('Menu item not found', 404));
        }
        
        res.status(200).json({
            success: true,
            data: menuItem
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new menu item
// @route   POST /api/menu
export const createMenuItem = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            return next(new AppError(errorMessages.join(', '), 400));
        }

        const menuItem = await MenuItem.create(req.body);
        
        res.status(201).json({
            success: true,
            data: menuItem
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
export const updateMenuItem = async (req, res, next) => {
    try {
        let menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return next(new AppError('Menu item not found', 404));
        }

        menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { 
                new: true, 
                runValidators: true 
            }
        );

        res.status(200).json({
            success: true,
            data: menuItem
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
export const deleteMenuItem = async (req, res, next) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return next(new AppError('Menu item not found', 404));
        }

        await MenuItem.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get menu by category
// @route   GET /api/menu/category/:category
export const getMenuByCategory = async (req, res, next) => {
    try {
        const menuItems = await MenuItem.getByCategory(req.params.category);
        
        res.status(200).json({
            success: true,
            count: menuItems.length,
            data: menuItems
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle menu item availability
// @route   PATCH /api/menu/:id/availability
export const toggleAvailability = async (req, res, next) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return next(new AppError('Menu item not found', 404));
        }

        await menuItem.toggleAvailability();

        res.status(200).json({
            success: true,
            data: menuItem,
            message: `Menu item ${menuItem.isAvailable ? 'enabled' : 'disabled'} successfully`
        });
    } catch (error) {
        next(error);
    }
};
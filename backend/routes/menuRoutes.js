import express from 'express';
import { body } from 'express-validator';
import {
    getMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMenuByCategory,
    toggleAvailability
} from '../controller/menuController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const menuItemValidation = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('price')
        .isFloat({ min: 0 }).withMessage('Valid price is required')
        .toFloat(),
    body('category')
        .isIn(['icecream', 'roll', 'shake', 'dessert', 'beverage']).withMessage('Valid category is required'),
    body('preparationTime')
        .optional()
        .isInt({ min: 1, max: 60 }).withMessage('Preparation time must be between 1 and 60 minutes'),
    body('spicyLevel')
        .optional()
        .isIn(['mild', 'medium', 'spicy', 'extra-spicy']).withMessage('Valid spicy level is required')
];

// Public routes
router.get('/', getMenuItems);
router.get('/category/:category', getMenuByCategory);
router.get('/:id', getMenuItem);

// Protected routes (Admin only)
router.post('/', protect, admin, menuItemValidation, createMenuItem);
router.put('/:id', protect, admin, menuItemValidation, updateMenuItem);
router.delete('/:id', protect, admin, deleteMenuItem);
router.patch('/:id/availability', protect, admin, toggleAvailability);

export default router;
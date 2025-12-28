import express from 'express';
import { body } from 'express-validator';
import {
    getCustomers,
    getCustomer,
    getCustomerOrders,
    updateCustomer,
    addFavoriteItem,
    removeFavoriteItem
} from '../controller/customerController.js';
import { protect, staff } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const updateCustomerValidation = [
    body('name')
        .optional()
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .optional()
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('address.street')
        .optional()
        .isLength({ max: 200 }).withMessage('Street address too long'),
    body('address.area')
        .optional()
        .isLength({ max: 100 }).withMessage('Area name too long'),
    body('address.city')
        .optional()
        .isLength({ max: 50 }).withMessage('City name too long'),
    body('preferences.spicyLevel')
        .optional()
        .isIn(['mild', 'medium', 'spicy', 'extra-spicy'])
        .withMessage('Valid spicy level is required')
];

const favoriteValidation = [
    body('menuItemId')
        .isMongoId().withMessage('Valid menu item ID is required')
];

router.get('/', protect, staff, getCustomers);
router.get('/:id', protect, staff, getCustomer);
router.get('/:id/orders', protect, staff, getCustomerOrders);
router.put('/:id', protect, staff, updateCustomerValidation, updateCustomer);
router.post('/:id/favorites', protect, staff, favoriteValidation, addFavoriteItem);
router.delete('/:id/favorites/:itemId', protect, staff, removeFavoriteItem);

export default router;
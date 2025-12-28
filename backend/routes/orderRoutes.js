import express from 'express';
import { body } from 'express-validator';
import {
    createOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    assignOrder,
    getTodayStats,
    cancelOrder
} from '../controller/orderController.js';
import { protect, staff, admin } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const orderValidation = [
    body('customer.name')
        .notEmpty().withMessage('Customer name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('customer.phone')
        .matches(/^03\d{9}$/).withMessage('Valid phone number is required (03XXXXXXXXX)'),
    body('customer.address')
        .if((value, { req }) => req.body.orderType === 'delivery')
        .notEmpty().withMessage('Address is required for delivery orders'),
    body('items')
        .isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.menuItem')
        .isMongoId().withMessage('Valid menu item ID is required'),
    body('items.*.quantity')
        .isInt({ min: 1, max: 50 }).withMessage('Quantity must be between 1 and 50'),
    body('orderType')
        .isIn(['dine-in', 'takeaway', 'delivery']).withMessage('Valid order type is required'),
    body('paymentMethod')
        .isIn(['cash', 'card', 'online']).withMessage('Valid payment method is required')
];

const statusValidation = [
    body('status')
        .isIn(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])
        .withMessage('Valid status is required')
];

const assignValidation = [
    body('assignedTo')
        .isMongoId().withMessage('Valid staff ID is required')
];

// Public routes (for customers to place orders)
router.post('/', orderValidation, createOrder);

// Protected routes (for staff/admin)
router.get('/', protect, staff, getOrders);
router.get('/today/stats', protect, staff, getTodayStats);
router.get('/:id', protect, staff, getOrder);
router.put('/:id/status', protect, staff, statusValidation, updateOrderStatus);
router.put('/:id/assign', protect, admin, assignValidation, assignOrder);
router.put('/:id/cancel', protect, staff, cancelOrder);

export default router;
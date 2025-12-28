import express from 'express';
import {
    getSalesAnalytics,
    getCustomerAnalytics,
    getInventoryAnalytics
} from '../controller/analyticsController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes are protected and admin only
router.get('/sales', protect, admin, getSalesAnalytics);
router.get('/customers', protect, admin, getCustomerAnalytics);
router.get('/inventory', protect, admin, getInventoryAnalytics);

export default router;
import express from 'express';
import { body } from 'express-validator';
import { 
    register, 
    login, 
    getMe, 
    updateProfile,
    logout 
} from '../controller/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const registerValidation = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('phone')
        .matches(/^03\d{9}$/).withMessage('Valid phone number is required (03XXXXXXXXX)')
];

const loginValidation = [
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

const updateProfileValidation = [
    body('name')
        .optional()
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('phone')
        .optional()
        .matches(/^03\d{9}$/).withMessage('Valid phone number is required (03XXXXXXXXX)')
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.post('/logout', protect, logout);

export default router;
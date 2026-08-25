const express = require('express');
const router = express.Router();

const {signup , signin , signout, sendVerificationCode, changePassword, sendForgotPasswordCode, verifyVerificationCode, verifyForgotPasswordCode} = require('../controllers/authController');
const { identifier } = require('../middlewares/identification');

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *              
 *               - email
 *               - password
 *             properties:
 *               
 *               email:
 *                 type: string
 *                 format: email
 *                 example: youremail@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/signup', signup)
router.post('/signin', signin)
router.post('/signout', identifier, signout)
router.patch('/send-verification-code',identifier, sendVerificationCode)
router.patch('/verify-verification-code',identifier , verifyVerificationCode)
router.patch('/change-password',identifier , changePassword)
router.patch('/send-forgot-password-code' , sendForgotPasswordCode)
router.patch('/verify-forgot-password-code' , verifyForgotPasswordCode)

module.exports = router
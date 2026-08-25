const express = require('express');
const router = express.Router();

const {signup , signin , signout, sendVerificationCode, changePassword, sendForgotPasswordCode, verifyVerificationCode, verifyForgotPasswordCode} = require('../controllers/authController');
const { identifier } = require('../middlewares/identification');

router.post('/signup', signup)
router.post('/signin', signin)
router.post('/signout', identifier, signout)
router.patch('/send-verification-code',identifier, sendVerificationCode)
router.patch('/verify-verification-code',identifier , verifyVerificationCode)
router.patch('/change-password',identifier , changePassword)
router.patch('/send-forgot-password-code' , sendForgotPasswordCode)
router.patch('/verify-forgot-password-code' , verifyForgotPasswordCode)

module.exports = router
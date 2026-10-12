import { Router } from 'express';
import {
  register,
  loginEmail,
  logout,
  getMe
} from '../controllers/authController.js';
import {
  verifyOtp,
  resendOtp,
  loginPhone,
  loginPhoneVerify
} from '../controllers/otpController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  validateRegistration,
  validateLoginEmail,
  validatePhoneOtpRequest,
  validateOtpPayload
} from '../middleware/validationMiddleware.js';
import { authRateLimiter, otpRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// Registration & Verification
router.post('/register', authRateLimiter, validateRegistration, register);
router.post('/verify-otp', otpRateLimiter, validateOtpPayload, verifyOtp);
router.post('/resend-otp', otpRateLimiter, resendOtp);

// Login Endpoints
router.post('/login', authRateLimiter, validateLoginEmail, loginEmail);
router.post('/login/phone', otpRateLimiter, validatePhoneOtpRequest, loginPhone);
router.post('/login/phone/verify', otpRateLimiter, loginPhoneVerify);

// Session Endpoints
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;

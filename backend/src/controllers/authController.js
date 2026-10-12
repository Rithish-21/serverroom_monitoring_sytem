import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { config } from '../config/env.js';
import { generateToken } from '../utils/jwtUtils.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';
import { createOtp } from '../services/otpService.js';
import { sendEmailOtp } from '../services/emailService.js';
import { sendSmsOtp } from '../services/smsService.js';

export const register = async (req, res, next) => {
  try {
    const { full_name, email, phone, password, role = 'user', admin_invite_code } = req.body;

    if (role === 'admin' && admin_invite_code !== config.adminInviteCode) {
      return sendError(res, 'Invalid admin invite code.', 403);
    }

    const existing = await query('SELECT id, email, phone FROM users WHERE email = ? OR phone = ?', [email, phone]);
    if (existing && existing.length > 0) {
      const match = existing[0];
      const field = match.email === email ? 'Email' : 'Phone number';
      return sendError(res, `${field} is already registered.`, 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (full_name, email, phone, password_hash, role, is_email_verified, is_phone_verified) VALUES (?, ?, ?, ?, ?, 0, 0)',
      [full_name, email, phone, passwordHash, role]
    );

    const userId = result.insertId;
    const emailOtp = await createOtp(userId, 'email');
    const phoneOtp = await createOtp(userId, 'phone');

    await Promise.all([
      sendEmailOtp(email, emailOtp),
      sendSmsOtp(phone, phoneOtp)
    ]);

    return sendSuccess(res, {
      userId,
      email,
      phone,
      role,
      requiresVerification: true,
      devTestEmailOtp: emailOtp,
      devTestPhoneOtp: phoneOtp
    }, 'Registration successful. OTPs sent to your email and phone.', 201);
  } catch (err) {
    next(err);
  }
};

export const loginEmail = async (req, res, next) => {
  try {
    const { email, password, requiredRole } = req.body;
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users || users.length === 0) return sendError(res, 'Invalid email or password.', 401);

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return sendError(res, 'Invalid email or password.', 401);

    if (requiredRole && user.role !== requiredRole) {
      return sendError(res, `Access denied: Account does not have ${requiredRole} access.`, 403);
    }

    if (!user.is_email_verified && !user.is_phone_verified) {
      return sendError(res, 'Account is unverified. Please verify your email or phone OTP first.', 403, {
        userId: user.id,
        isUnverified: true
      });
    }

    const token = generateToken({ userId: user.id, role: user.role });
    return sendSuccess(res, {
      token,
      user: { id: user.id, fullName: user.full_name, email: user.email, phone: user.phone, role: user.role }
    }, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => sendSuccess(res, null, 'Logged out successfully.');

export const getMe = async (req, res) => sendSuccess(res, { user: req.user }, 'Current user profile.');

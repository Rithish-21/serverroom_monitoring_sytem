import { query } from '../config/db.js';
import { generateToken } from '../utils/jwtUtils.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';
import { createOtp, verifyOtpCode, canResendOtp } from '../services/otpService.js';
import { sendEmailOtp } from '../services/emailService.js';
import { sendSmsOtp } from '../services/smsService.js';

export const verifyOtp = async (req, res, next) => {
  try {
    const { userId, channel, otp } = req.body;
    if (!userId || !channel || !otp) {
      return sendError(res, 'Missing userId, channel, or OTP.', 400);
    }

    const verification = await verifyOtpCode(userId, channel, otp);
    if (!verification.valid) {
      return sendError(res, verification.message, 400);
    }

    if (channel === 'email') {
      await query('UPDATE users SET is_email_verified = 1 WHERE id = ?', [userId]);
    } else if (channel === 'phone') {
      await query('UPDATE users SET is_phone_verified = 1 WHERE id = ?', [userId]);
    }

    const users = await query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = users[0];
    const isFullyVerified = user && (user.is_email_verified || user.is_phone_verified);
    let token = null;
    if (isFullyVerified) {
      token = generateToken({ userId: user.id, role: user.role });
    }

    return sendSuccess(res, {
      userId: user.id,
      channel,
      isEmailVerified: !!user.is_email_verified,
      isPhoneVerified: !!user.is_phone_verified,
      isFullyVerified,
      token,
      user: { id: user.id, fullName: user.full_name, email: user.email, phone: user.phone, role: user.role }
    }, `${channel.toUpperCase()} successfully verified.`);
  } catch (err) {
    next(err);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { userId, channel } = req.body;
    if (!userId || !channel) return sendError(res, 'userId and channel are required.', 400);

    const cooldownCheck = await canResendOtp(userId, channel);
    if (!cooldownCheck.allowed) return sendError(res, cooldownCheck.message, 429);

    const users = await query('SELECT email, phone FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) return sendError(res, 'User not found.', 404);

    const user = users[0];
    const newOtp = await createOtp(userId, channel);

    if (channel === 'email') {
      await sendEmailOtp(user.email, newOtp);
    } else {
      await sendSmsOtp(user.phone, newOtp);
    }

    return sendSuccess(res, { channel, devTestOtp: newOtp }, `New OTP sent to your ${channel}.`);
  } catch (err) {
    next(err);
  }
};

export const loginPhone = async (req, res, next) => {
  try {
    const { phone, requiredRole } = req.body;
    const users = await query('SELECT * FROM users WHERE phone = ?', [phone]);
    if (!users || users.length === 0) return sendError(res, 'No account found with this phone number.', 404);

    const user = users[0];
    if (requiredRole && user.role !== requiredRole) {
      return sendError(res, `Access denied: Account does not have ${requiredRole} privileges.`, 403);
    }

    const cooldownCheck = await canResendOtp(user.id, 'phone');
    if (!cooldownCheck.allowed) return sendError(res, cooldownCheck.message, 429);

    const otp = await createOtp(user.id, 'phone');
    await sendSmsOtp(user.phone, otp);

    return sendSuccess(res, { userId: user.id, phone: user.phone, devTestPhoneOtp: otp }, 'OTP sent to your phone number.');
  } catch (err) {
    next(err);
  }
};

export const loginPhoneVerify = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const users = await query('SELECT * FROM users WHERE phone = ?', [phone]);
    if (!users || users.length === 0) return sendError(res, 'User not found.', 404);

    const user = users[0];
    const verification = await verifyOtpCode(user.id, 'phone', otp);
    if (!verification.valid) return sendError(res, verification.message, 400);

    await query('UPDATE users SET is_phone_verified = 1 WHERE id = ?', [user.id]);
    const token = generateToken({ userId: user.id, role: user.role });

    return sendSuccess(res, {
      token,
      user: { id: user.id, fullName: user.full_name, email: user.email, phone: user.phone, role: user.role }
    }, 'Phone OTP verified successfully.');
  } catch (err) {
    next(err);
  }
};

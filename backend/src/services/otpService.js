import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 3;

export const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const canResendOtp = async (userId, channel) => {
  const rows = await query(
    'SELECT created_at FROM otp_codes WHERE user_id = ? AND channel = ? ORDER BY id DESC LIMIT 1',
    [userId, channel]
  );
  if (!rows || rows.length === 0) return { allowed: true };

  const lastCreated = new Date(rows[0].created_at).getTime();
  const now = Date.now();
  const diff = now - lastCreated;

  if (diff < RESEND_COOLDOWN_MS) {
    const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - diff) / 1000);
    return {
      allowed: false,
      remainingSeconds,
      message: `Please wait ${remainingSeconds}s before requesting a new OTP.`
    };
  }
  return { allowed: true };
};

export const createOtp = async (userId, channel) => {
  const plainOtp = generateOtpCode();
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(plainOtp, salt);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await query(
    'INSERT INTO otp_codes (user_id, channel, otp_hash, expires_at) VALUES (?, ?, ?, ?)',
    [userId, channel, otpHash, expiresAt]
  );

  return plainOtp;
};

export const verifyOtpCode = async (userId, channel, candidateOtp) => {
  const rows = await query(
    'SELECT id, otp_hash, expires_at, attempts FROM otp_codes WHERE user_id = ? AND channel = ? ORDER BY id DESC LIMIT 1',
    [userId, channel]
  );

  if (!rows || rows.length === 0) {
    return { valid: false, message: 'No OTP code found for this user/channel.' };
  }

  const record = rows[0];

  if (record.attempts >= MAX_ATTEMPTS) {
    return { valid: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' };
  }

  const expiresTime = new Date(record.expires_at).getTime();
  if (Date.now() > expiresTime) {
    return { valid: false, message: 'OTP has expired. Please request a new code.' };
  }

  const isMatch = await bcrypt.compare(candidateOtp, record.otp_hash);
  if (!isMatch) {
    await query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?', [record.id]);
    const attemptsLeft = MAX_ATTEMPTS - (record.attempts + 1);
    return {
      valid: false,
      message: `Invalid OTP code. ${attemptsLeft > 0 ? attemptsLeft + ' attempts remaining.' : 'Code locked.'}`
    };
  }

  // Clear or mark used
  await query('DELETE FROM otp_codes WHERE user_id = ? AND channel = ?', [userId, channel]);
  return { valid: true };
};

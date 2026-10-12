import { sendError } from '../utils/responseUtils.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_PHONE_REGEX = /^\+[1-9]\d{1,14}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

export const validateRegistration = (req, res, next) => {
  const { full_name, email, phone, password, confirm_password, role, admin_invite_code } = req.body;

  if (!full_name || full_name.trim().length < 2) {
    return sendError(res, 'Full name must be at least 2 characters.', 400);
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return sendError(res, 'Please provide a valid email address.', 400);
  }

  if (!phone || !E164_PHONE_REGEX.test(phone)) {
    return sendError(res, 'Phone number must be in international E.164 format (e.g. +12025550199).', 400);
  }

  if (!password || !PASSWORD_REGEX.test(password)) {
    return sendError(
      res,
      'Password must be at least 8 characters long and contain at least one letter, one number, and one special character (@$!%*#?&).',
      400
    );
  }

  if (password !== confirm_password) {
    return sendError(res, 'Passwords do not match.', 400);
  }

  if (role === 'admin' && !admin_invite_code) {
    return sendError(res, 'Admin registration requires a valid admin invite code.', 400);
  }

  next();
};

export const validateLoginEmail = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !EMAIL_REGEX.test(email)) {
    return sendError(res, 'Please provide a valid email address.', 400);
  }
  if (!password) {
    return sendError(res, 'Password is required.', 400);
  }
  next();
};

export const validatePhoneOtpRequest = (req, res, next) => {
  const { phone } = req.body;
  if (!phone || !E164_PHONE_REGEX.test(phone)) {
    return sendError(res, 'Valid E.164 phone number is required (e.g. +12025550199).', 400);
  }
  next();
};

export const validateOtpPayload = (req, res, next) => {
  const { channel, otp } = req.body;
  if (!['email', 'phone'].includes(channel)) {
    return sendError(res, 'Channel must be either email or phone.', 400);
  }
  if (!otp || !/^\d{6}$/.test(otp)) {
    return sendError(res, 'OTP must be a 6-digit numeric code.', 400);
  }
  next();
};

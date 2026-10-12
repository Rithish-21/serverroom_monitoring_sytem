import api from './api.js';

export const authService = {
  async register(payload) {
    const res = await api.post('/auth/register', payload);
    return res.data;
  },

  async verifyOtp(payload) {
    const res = await api.post('/auth/verify-otp', payload);
    return res.data;
  },

  async resendOtp(payload) {
    const res = await api.post('/auth/resend-otp', payload);
    return res.data;
  },

  async loginEmail(email, password, requiredRole) {
    const res = await api.post('/auth/login', { email, password, requiredRole });
    return res.data;
  },

  async requestPhoneOtp(phone, requiredRole) {
    const res = await api.post('/auth/login/phone', { phone, requiredRole });
    return res.data;
  },

  async verifyPhoneLogin(phone, otp) {
    const res = await api.post('/auth/login/phone/verify', { phone, otp });
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('sentinel_token');
      localStorage.removeItem('sentinel_user');
    }
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

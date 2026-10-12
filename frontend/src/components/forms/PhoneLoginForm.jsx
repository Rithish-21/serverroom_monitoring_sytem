import React, { useState } from 'react';
import { authService } from '../../services/authService.js';

export const PhoneLoginForm = ({ role, onSuccess, onError }) => {
  const defaultPhone = role === 'admin' ? '+12025550199' : '+12025550188';

  const [step, setStep] = useState('request');
  const [phone, setPhone] = useState(() => {
    return localStorage.getItem(`sentinel_saved_${role}_phone`) || defaultPhone;
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');

  const handleRequest = async (e) => {
    e.preventDefault();
    onError('');
    setLoading(true);
    localStorage.setItem(`sentinel_saved_${role}_phone`, phone);

    try {
      const res = await authService.requestPhoneOtp(phone, role);
      setStep('verify');
      const devOtp = res.data?.devTestPhoneOtp ? ` (Dev OTP: ${res.data.devTestPhoneOtp})` : '';
      setInfo(`OTP sent to ${phone}.${devOtp}`);
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to dispatch phone OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    onError('');
    setLoading(true);
    try {
      const res = await authService.verifyPhoneLogin(phone, otp);
      onSuccess(res.data.token, res.data.user);
    } catch (err) {
      onError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'request') {
    return (
      <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="form-label">Phone Number (E.164 Format)</label>
          <input className="form-input" type="tel" placeholder="+12025550199" value={phone} onChange={e => setPhone(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
          {loading ? 'Dispatching OTP...' : 'Send 6-Digit OTP'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {info && <div style={{ fontSize: '12px', color: '#6ee7b7' }}>{info}</div>}
      <div>
        <label className="form-label">Enter 6-Digit OTP</label>
        <input className="form-input" type="text" maxLength="6" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} required style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '6px', fontFamily: 'var(--font-mono)' }} />
      </div>
      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
        {loading ? 'Verifying...' : 'Verify & Enter Dashboard'}
      </button>
    </form>
  );
};

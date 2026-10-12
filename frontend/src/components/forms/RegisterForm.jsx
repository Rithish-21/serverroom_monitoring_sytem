import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService.js';

export const RegisterForm = ({ role, onError }) => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+1');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminInviteCode, setAdminInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError('');

    if (password !== confirmPassword) {
      onError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({
        full_name: fullName,
        email,
        phone,
        password,
        confirm_password: confirmPassword,
        role,
        admin_invite_code: adminInviteCode
      });

      const { userId, devTestEmailOtp, devTestPhoneOtp } = res.data;
      navigate('/verify-otp', {
        state: { userId, email, phone, role, devEmailOtp: devTestEmailOtp, devPhoneOtp: devTestPhoneOtp }
      });
    } catch (err) {
      onError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label className="form-label">Full Name</label>
        <input className="form-input" placeholder="Alex Vance" value={fullName} onChange={e => setFullName(e.target.value)} required />
      </div>
      <div>
        <label className="form-label">Email Address</label>
        <input className="form-input" type="email" placeholder="alex@datacenter.io" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="form-label">Phone Number (with Country Code)</label>
        <input className="form-input" type="tel" placeholder="+12025550199" value={phone} onChange={e => setPhone(e.target.value)} required />
      </div>
      <div>
        <label className="form-label">Password (min 8 chars, letter, number, symbol)</label>
        <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <div>
        <label className="form-label">Confirm Password</label>
        <input className="form-input" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
      </div>
      {role === 'admin' && (
        <div>
          <label className="form-label" style={{ color: 'var(--status-warning)' }}>Admin Invite Code (.env secret)</label>
          <input className="form-input" type="password" placeholder="ADMIN_DC_SECURE_2025" value={adminInviteCode} onChange={e => setAdminInviteCode(e.target.value)} required />
        </div>
      )}
      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '6px' }} disabled={loading}>
        {loading ? 'Processing...' : 'Register Account'}
      </button>
    </form>
  );
};

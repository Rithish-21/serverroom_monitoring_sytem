import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/authService.js';
import { ShieldCheck, Mail, Phone, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';

export const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const state = location.state || {};
  const userId = state.userId;
  const userEmail = state.email || '';
  const userPhone = state.phone || '';
  const role = state.role || 'user';

  const [activeChannel, setActiveChannel] = useState('email');
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');

  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer = null;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (channel) => {
    setError('');
    const code = channel === 'email' ? emailOtp : phoneOtp;
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifyOtp({
        userId,
        channel,
        otp: code
      });

      if (channel === 'email') setEmailVerified(true);
      if (channel === 'phone') setPhoneVerified(true);

      setSuccessMsg(`${channel.toUpperCase()} successfully verified!`);

      if (res.data?.token) {
        setAuth(res.data.token, res.data.user);
        setTimeout(() => {
          navigate(role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError('');
    try {
      const res = await authService.resendOtp({ userId, channel: activeChannel });
      setCooldown(60);
      setSuccessMsg(`New OTP sent to your ${activeChannel}! ${res.data?.devTestOtp ? `(Dev Code: ${res.data.devTestOtp})` : ''}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#070a13', padding: '24px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <ShieldCheck size={24} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>Verify Your Account</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            A 6-digit verification code has been dispatched.
          </p>
        </div>

        {/* Developer Sandbox Testing Helper */}
        {(state.devEmailOtp || state.devPhoneOtp) && (
          <div style={{ padding: '10px 14px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 'var(--radius-sm)', marginBottom: '18px', fontSize: '12px', color: 'var(--primary)' }}>
            <div><strong>Dev OTP Preview:</strong></div>
            {state.devEmailOtp && <div>Email Code: <code style={{ color: '#fff' }}>{state.devEmailOtp}</code></div>}
            {state.devPhoneOtp && <div>Phone Code: <code style={{ color: '#fff' }}>{state.devPhoneOtp}</code></div>}
          </div>
        )}

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-sm)', color: '#6ee7b7', fontSize: '13px', marginBottom: '16px' }}>
            {successMsg}
          </div>
        )}

        {/* Channel Switch Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
          <button
            className={`btn ${activeChannel === 'email' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', padding: '8px' }}
            onClick={() => { setActiveChannel('email'); setError(''); }}
          >
            <Mail size={14} /> Email {emailVerified ? '✓' : ''}
          </button>
          <button
            className={`btn ${activeChannel === 'phone' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', padding: '8px' }}
            onClick={() => { setActiveChannel('phone'); setError(''); }}
          >
            <Phone size={14} /> Phone {phoneVerified ? '✓' : ''}
          </button>
        </div>

        {activeChannel === 'email' ? (
          <div>
            <label className="form-label">Email OTP (sent to {userEmail || 'registered email'})</label>
            <input
              className="form-input"
              type="text"
              maxLength="6"
              placeholder="••••••"
              value={emailOtp}
              onChange={e => setEmailOtp(e.target.value)}
              style={{ textAlign: 'center', fontSize: '22px', letterSpacing: '6px', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}
            />
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
              onClick={() => handleVerify('email')}
              disabled={loading || emailVerified}
            >
              {emailVerified ? 'Email Verified ✓' : loading ? 'Verifying...' : 'Verify Email Code'}
            </button>
          </div>
        ) : (
          <div>
            <label className="form-label">Phone OTP (sent to {userPhone || 'registered phone'})</label>
            <input
              className="form-input"
              type="text"
              maxLength="6"
              placeholder="••••••"
              value={phoneOtp}
              onChange={e => setPhoneOtp(e.target.value)}
              style={{ textAlign: 'center', fontSize: '22px', letterSpacing: '6px', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}
            />
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
              onClick={() => handleVerify('phone')}
              disabled={loading || phoneVerified}
            >
              {phoneVerified ? 'Phone Verified ✓' : loading ? 'Verifying...' : 'Verify Phone Code'}
            </button>
          </div>
        )}

        {/* Resend Cooldown Section */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-dim)' }}>
            Code expires in 5m
          </span>
          <button
            onClick={handleResend}
            disabled={cooldown > 0}
            style={{
              background: 'none',
              border: 'none',
              color: cooldown > 0 ? 'var(--text-dim)' : 'var(--primary)',
              cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
          >
            <RefreshCw size={12} />
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

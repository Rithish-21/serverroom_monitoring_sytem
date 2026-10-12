import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authService } from '../../services/authService.js';
import { Shield, Mail, Phone, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { PhoneLoginForm } from './PhoneLoginForm.jsx';
import { RegisterForm } from './RegisterForm.jsx';

export const AuthForm = ({ mode = 'login', role = 'user' }) => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const isAdmin = role === 'admin';

  // Default credentials
  const defaultEmail = isAdmin ? 'admin@datacenter.io' : 'user@datacenter.io';
  const defaultPassword = isAdmin ? 'AdminPassword123!' : 'UserPassword123!';

  const [loginMethod, setLoginMethod] = useState('email');
  const [email, setEmail] = useState(() => {
    return localStorage.getItem(`sentinel_saved_${role}_email`) || defaultEmail;
  });
  const [password, setPassword] = useState(() => {
    return localStorage.getItem(`sentinel_saved_${role}_password`) || defaultPassword;
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync defaults if role changes
  useEffect(() => {
    const savedEmail = localStorage.getItem(`sentinel_saved_${role}_email`) || defaultEmail;
    const savedPass = localStorage.getItem(`sentinel_saved_${role}_password`) || defaultPassword;
    setEmail(savedEmail);
    setPassword(savedPass);
  }, [role, defaultEmail, defaultPassword]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (rememberMe) {
      localStorage.setItem(`sentinel_saved_${role}_email`, email);
      localStorage.setItem(`sentinel_saved_${role}_password`, password);
    }

    try {
      const res = await authService.loginEmail(email, password, role);
      setAuth(res.data.token, res.data.user);
      navigate(isAdmin ? '/admin/dashboard' : '/user/dashboard');
    } catch (err) {
      if (err.response?.data?.errors?.isUnverified) {
        navigate('/verify-otp', {
          state: { userId: err.response.data.errors.userId, email, role }
        });
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (token, user) => {
    setAuth(token, user);
    navigate(isAdmin ? '/admin/dashboard' : '/user/dashboard');
  };

  const handleAutoFill = () => {
    setEmail(defaultEmail);
    setPassword(defaultPassword);
    localStorage.setItem(`sentinel_saved_${role}_email`, defaultEmail);
    localStorage.setItem(`sentinel_saved_${role}_password`, defaultPassword);
  };

  const isLogin = mode === 'login';

  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isAdmin ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', border: `1px solid ${isAdmin ? 'rgba(245, 158, 11, 0.4)' : 'rgba(56, 189, 248, 0.4)'}` }}>
          <Shield size={24} color={isAdmin ? 'var(--status-warning)' : 'var(--primary)'} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>
          {isAdmin ? 'Admin' : 'Operator'} {isLogin ? 'Sign In' : 'Registration'}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {isAdmin ? 'Privileged Datacenter Portal' : 'Environment Telemetry Console'}
        </p>
      </div>

      {/* Saved Credentials Hint / Auto Fill Banner */}
      {isLogin && (
        <div style={{ marginBottom: '18px', padding: '10px 14px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <div style={{ color: 'var(--text-muted)' }}>
            <div><strong style={{ color: '#fff' }}>Saved ID:</strong> {defaultEmail}</div>
            <div><strong style={{ color: '#fff' }}>Password:</strong> {defaultPassword}</div>
          </div>
          <button type="button" onClick={handleAutoFill} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--primary)', borderColor: 'rgba(56,189,248,0.3)' }}>
            <KeyRound size={12} /> Pre-fill
          </button>
        </div>
      )}

      {error && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {isLogin && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button type="button" className={`btn ${loginMethod === 'email' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '12px', padding: '8px' }} onClick={() => { setLoginMethod('email'); setError(''); }}>
            <Mail size={14} /> Email & Password
          </button>
          <button type="button" className={`btn ${loginMethod === 'phone' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '12px', padding: '8px' }} onClick={() => { setLoginMethod('phone'); setError(''); }}>
            <Phone size={14} /> Phone & OTP
          </button>
        </div>
      )}

      {isLogin && loginMethod === 'email' && (
        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="form-label">Email Address (Login ID)</label>
            <input className="form-input" type="email" placeholder="admin@datacenter.io" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ cursor: 'pointer' }} />
            <label htmlFor="rememberMe" style={{ cursor: 'pointer' }}>Remember login ID and password</label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '4px' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>
      )}

      {isLogin && loginMethod === 'phone' && (
        <PhoneLoginForm role={role} onSuccess={handleLoginSuccess} onError={setError} />
      )}

      {!isLogin && (
        <RegisterForm role={role} onError={setError} />
      )}

      <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        {isLogin ? (
          <div>
            Don't have an account?{' '}
            <Link to={isAdmin ? '/admin/register' : '/user/register'} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
              Register here
            </Link>
          </div>
        ) : (
          <div>
            Already registered?{' '}
            <Link to={isAdmin ? '/admin/login' : '/user/login'} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
              Sign in here
            </Link>
          </div>
        )}
        <div style={{ marginTop: '10px' }}>
          <Link to="/" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px' }}>
            ← Return to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
};

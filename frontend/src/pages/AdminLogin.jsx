import React from 'react';
import { AuthForm } from '../components/forms/AuthForm.jsx';

export const AdminLogin = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#070a13', padding: '24px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '24px', left: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
        SENTINELCORE // ADMIN ACCESS
      </div>
      <AuthForm mode="login" role="admin" />
    </div>
  );
};

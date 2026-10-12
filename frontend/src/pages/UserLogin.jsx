import React from 'react';
import { AuthForm } from '../components/forms/AuthForm.jsx';

export const UserLogin = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#070a13', padding: '24px' }}>
      <AuthForm mode="login" role="user" />
    </div>
  );
};

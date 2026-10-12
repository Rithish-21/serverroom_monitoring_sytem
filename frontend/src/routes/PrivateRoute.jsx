import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#070a13', color: '#38bdf8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(56,189,248,0.2)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '14px', letterSpacing: '0.05em' }}>AUTHENTICATING ACCESS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectPath = requiredRole === 'admin' ? '/admin/login' : '/user/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // If a regular user tries to access admin route, redirect to user dashboard
    if (user?.role === 'user' && requiredRole === 'admin') {
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  return children;
};

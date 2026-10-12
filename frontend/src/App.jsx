import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { PrivateRoute } from './routes/PrivateRoute.jsx';

import { Landing } from './pages/Landing.jsx';
import { AdminLogin } from './pages/AdminLogin.jsx';
import { AdminRegister } from './pages/AdminRegister.jsx';
import { UserLogin } from './pages/UserLogin.jsx';
import { UserRegister } from './pages/UserRegister.jsx';
import { VerifyOtp } from './pages/VerifyOtp.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { UserDashboard } from './pages/UserDashboard.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Authentication Portals */}
          <Route path="/" element={<Landing />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/register" element={<UserRegister />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />

          {/* Protected Role-Based Portals */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/dashboard"
            element={
              <PrivateRoute requiredRole="user">
                <UserDashboard />
              </PrivateRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

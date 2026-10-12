import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout.jsx';

export const AdminDashboard = () => {
  return <DashboardLayout isAdmin={true} />;
};

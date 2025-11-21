
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ChangePassword from '@/pages/ChangePassword';
import Dashboard from '@/pages/Dashboard';
import Questions from '@/pages/Questions';
import Clients from '@/pages/Clients';
import Assessment from '@/pages/Assessment';
import Approvals from '@/pages/Approvals';
import Assessments from '@/pages/Assessments';
import Reports from '@/pages/Reports';
import Categories from '@/pages/Categories';
import ViewAssessment from '@/pages/ViewAssessment';
import AdminApproval from '@/pages/AdminApproval';
import Home from '@/pages/Home'; // Import the new Home component
import KycUpload from '@/pages/KycUpload';
import SelectDistributionChannel from '@/pages/SelectDistributionChannel';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DistributionChannelProvider } from '@/contexts/DistributionChannelContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const { loading } = useAuth();

  // While auth is initializing, don't redirect — show nothing (or a spinner)
  if (loading) {
    return null;
  }

  if (!user) {
    // When not logged in, show Home page
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <DistributionChannelProvider>
        <Helmet>
          <title>Customer Due Diligence System</title>
          <meta name="description" content="Professional CDD system for risk assessment and compliance management" />
        </Helmet>
        <Routes>
        <Route path="/" element={<Home />} /> {/* Set Home as the root page */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/select-distribution-channel"
          element={
            <ProtectedRoute>
              <SelectDistributionChannel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute>
              <AdminApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/questions"
          element={
            <ProtectedRoute allowedRoles={['admin', 'compliance']}>
              <Questions />
            </ProtectedRoute>
          }
        />
         <Route
          path="/categories"
          element={
            <ProtectedRoute allowedRoles={['admin', 'compliance']}>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kyc-upload"
          element={
            <ProtectedRoute>
              <KycUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/:clientId"
          element={
            <ProtectedRoute>
              <Assessment />
            </ProtectedRoute>
          }
        />
         <Route
          path="/assessment/view/:assessmentId"
          element={
            <ProtectedRoute allowedRoles={['admin', 'compliance']}>
              <ViewAssessment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approvals"
          element={
            <ProtectedRoute allowedRoles={['admin', 'compliance']}>
              <Approvals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments"
          element={
            <ProtectedRoute>
              <Assessments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute allowedRoles={['admin', 'compliance']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['admin', 'compliance']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        {/* Removed the old root Navigate, as '/' now points to Home */}
        </Routes>
      </DistributionChannelProvider>
    </AuthProvider>
  );
}

export default App;


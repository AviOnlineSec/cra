
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Questions from '@/pages/Questions';
import Clients from '@/pages/Clients';
import Assessment from '@/pages/Assessment';
import Approvals from '@/pages/Approvals';
import Assessments from '@/pages/Assessments';
import Reports from '@/pages/Reports';
import Categories from '@/pages/Categories';
import ViewAssessment from '@/pages/ViewAssessment';
import Home from '@/pages/Home'; // Import the new Home component
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { useCompany } from '@/contexts/CompanyContext';
import SelectCompany from '@/pages/SelectCompany';

function ProtectedRoute({ children, allowedRoles, requireCompany = true }) {
  const { user } = useAuth();
  const { selectedCompanyId } = useCompany();

  if (!user) {
    // When not logged in, show Home page
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireCompany && !user.isSuperuser && !selectedCompanyId) {
    return <Navigate to="/select-company" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
      <Helmet>
        <title>Customer Due Diligence System</title>
        <meta name="description" content="Professional CDD system for risk assessment and compliance management" />
      </Helmet>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Set Home as the root page */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/select-company"
          element={
            <ProtectedRoute requireCompany={false}>
              <SelectCompany />
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
      </CompanyProvider>
    </AuthProvider>
  );
}

export default App;

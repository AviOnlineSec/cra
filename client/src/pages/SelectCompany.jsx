import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/contexts/AuthContext';

export default function SelectCompany() {
  const { companies, selectedCompanyId, selectCompany } = useCompany();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.isSuperuser) {
      // Superusers are not required to select a company
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (selectedCompanyId) {
      navigate('/dashboard');
    }
  }, [selectedCompanyId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Helmet>
        <title>Select Company - CDD System</title>
        <meta name="description" content="Choose your active company to continue" />
      </Helmet>
      <div className="max-w-lg w-full bg-white rounded-xl shadow-xl p-8 text-center">
        <div className="flex items-center mb-6">
          {/* <img alt="Logo" className="h-12 w-12 mr-3 rounded" src="" /> */}
          <h1 className="text-center text-2xl font-bold text-gray-900">Select Your Company</h1>
        </div>
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => { selectCompany(null); logout(); }}
            className="px-3 py-2 text-sm font-medium rounded-lg bg-red-50 border border-red-300 text-gray-700 hover:bg-red-100"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>

        {companies.length === 0 ? (
          <div className="text-gray-600">
            <p className="mb-4">No companies available for your account.</p>
            <p className="text-sm">Please contact your administrator to be added to a company.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCompany(c.id)}
                className={`w-full text-left px-4 py-3 border rounded-lg transition shadow-sm hover:shadow-md hover:border-blue-400 ${
                  selectedCompanyId === c.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{c.name}</span>
                  <span className="text-sm text-gray-500">ID: {c.id}</span>
                </div>
              </button>
            ))}
            <p className="text-xs text-gray-500">Your selection sets the active company for data access.</p>
          </div>
        )}
      </div>
    </div>
  );
}
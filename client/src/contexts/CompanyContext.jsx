import React, { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '@/api/axios';

const CompanyContext = createContext(null);

export const useCompany = () => {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
};

export const CompanyProvider = ({ children }) => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(() => {
    const saved = localStorage.getItem('cdd_company_id');
    return saved ? parseInt(saved, 10) : null;
  });

  useEffect(() => {
    // Load companies accessible to the current user
    axiosInstance
      .get('/api/companies/')
      .then((res) => setCompanies(res.data || []))
      .catch(() => setCompanies([]));
  }, []);

  const selectCompany = (companyId) => {
    setSelectedCompanyId(companyId || null);
    if (companyId) {
      localStorage.setItem('cdd_company_id', String(companyId));
    } else {
      localStorage.removeItem('cdd_company_id');
    }
  };

  return (
    <CompanyContext.Provider value={{ companies, selectedCompanyId, selectCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/api/axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from access token
  useEffect(() => {
    const accessToken = localStorage.getItem('cdd_access_token');
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
        setUser({
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          isSuperuser: decoded.is_superuser === true || decoded.isSuperuser === true,
        });
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // Refresh access token if refresh token exists
  useEffect(() => {
    const refreshToken = localStorage.getItem('cdd_refresh_token');
    if (refreshToken) {
      axiosInstance.post('/api/token/refresh/', { refresh: refreshToken })
        .then(response => {
          localStorage.setItem('cdd_access_token', response.data.access);
          axiosInstance.defaults.headers['Authorization'] = `Bearer ${response.data.access}`;
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem('cdd_access_token');
          localStorage.removeItem('cdd_refresh_token');
          delete axiosInstance.defaults.headers['Authorization'];
          navigate('/login');
        });
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/api/token/', { email, password });
      localStorage.setItem('cdd_access_token', response.data.access);
      localStorage.setItem('cdd_refresh_token', response.data.refresh);
      axiosInstance.defaults.headers['Authorization'] = `Bearer ${response.data.access}`;

      const decodedUser = jwtDecode(response.data.access);
      setUser({
        email: decodedUser.email,
        name: decodedUser.name,
        role: decodedUser.role,
        isSuperuser: decodedUser.is_superuser === true || decodedUser.isSuperuser === true,
      });
      // After login, go to company selection first
      navigate('/select-company');
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cdd_access_token');
    localStorage.removeItem('cdd_refresh_token');
    delete axiosInstance.defaults.headers['Authorization'];
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


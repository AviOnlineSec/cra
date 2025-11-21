import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import axiosInstance from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  // Redirect if not required to change password
  useEffect(() => {
    // Check if user needs to change password (from token)
    const accessToken = localStorage.getItem('cdd_access_token');
    if (accessToken) {
      try {
        const parts = accessToken.split('.');
        if (parts.length >= 2) {
          const payload = parts[1];
          const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
          const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
          const json = atob(padded);
          const decoded = JSON.parse(json);
          if (!decoded.must_change_password) {
            navigate('/dashboard');
          }
        }
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      if (!formData.old_password || !formData.new_password || !formData.new_password_confirm) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      if (formData.new_password.length < 8) {
        setError('New password must be at least 8 characters');
        setLoading(false);
        return;
      }

      if (formData.new_password !== formData.new_password_confirm) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (formData.old_password === formData.new_password) {
        setError('New password must be different from current password');
        setLoading(false);
        return;
      }

      const response = await axiosInstance.post('/api/users/change-password/', formData);

      if (response.status === 200) {
        setSuccess(true);
        // Automatically re-login with new password to get fresh tokens/claims
        try {
          // await login so tokens and user context update; login will redirect to /dashboard
          await login(user.email, formData.new_password);
        } catch (err) {
          // If automatic login fails, fallback to explicit navigation to login page
          console.error('Automatic re-login failed', err);
          setTimeout(() => navigate('/login'), 1500);
        }
      }
    } catch (err) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.old_password) {
          setError('Current password is incorrect');
        } else if (errorData.new_password) {
          setError(Array.isArray(errorData.new_password) ? errorData.new_password[0] : errorData.new_password);
        } else if (errorData.message) {
          setError(errorData.message);
        } else {
          setError('Failed to change password. Please try again.');
        }
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
        <Helmet>
          <title>Password Changed - CDD System</title>
        </Helmet>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Changed!</h2>
            <p className="text-gray-600">
              Your password has been successfully changed. Redirecting to dashboard...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <Helmet>
        <title>Change Password - CDD System</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0F2027] to-[#2C5364] px-8 py-10 text-white">
            <h1 className="text-3xl font-bold mb-2">Change Password</h1>
            <p className="text-blue-100">Set your new password to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>First login:</strong> You must change your temporary password to set a new one.
              </p>
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Current Password (Temporary)
                </div>
              </label>
              <input
                type="password"
                name="old_password"
                value={formData.old_password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter temporary password"
                required
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  New Password
                </div>
              </label>
              <input
                type="password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Min. 8 characters"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm New Password
                </div>
              </label>
              <input
                type="password"
                name="new_password_confirm"
                value={formData.new_password_confirm}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Confirm new password"
                required
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-[#0F2027] to-[#2C5364] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Updating Password...' : 'Change Password'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import axiosInstance from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';
import { Check, X, Mail, AlertCircle, Loader, ShieldCheck, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AdminApproval() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingUserId, setRejectingUserId] = useState(null);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/users/approvals/');
      setApprovals(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
      setError('Failed to load registration requests. Please try again.');
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setProcessingId(userId);
    try {
      await axiosInstance.post('/api/users/approvals/approve_user/', {
        user_id: userId,
        action: 'approve',
      });
      // Remove from list
      setApprovals(prev => prev.filter(a => a.user !== userId));
      setSuccess('User approved successfully! Email sent to user.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to approve user: ' + (err.response?.data?.detail || err.message));
      setTimeout(() => setError(''), 5000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setProcessingId(userId);
    try {
      await axiosInstance.post('/api/users/approvals/approve_user/', {
        user_id: userId,
        action: 'reject',
        rejection_reason: rejectionReason,
      });
      // Remove from list
      setApprovals(prev => prev.filter(a => a.user !== userId));
      setRejectingUserId(null);
      setRejectionReason('');
      setSuccess('User rejected successfully! Email sent to user.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to reject user: ' + (err.response?.data?.detail || err.message));
      setTimeout(() => setError(''), 5000);
    } finally {
      setProcessingId(null);
    }
  };

  // Check authorization
  if (!user?.isSuperuser && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-center max-w-md"
        >
          <div className="bg-red-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-blue-200">Only administrators can access this page.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4">
      <Helmet>
        <title>User Approvals - Admin</title>
      </Helmet>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4 justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">User Registration Approvals</h1>
                <p className="text-blue-200">Review and approve pending user registrations</p>
              </div>
            </div>

            {/* Show Back to Home when there are approved users */}
            {approvals.some(a => a.status === 'approved') && (
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
              >
                Back to Home
              </Link>
            )}
          </div>
        </motion.div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-500/20 border border-green-500/50 text-green-200 rounded-lg p-4 mb-6 flex gap-3 items-center"
          >
            <Check className="w-5 h-5 flex-shrink-0" />
            <p>{success}</p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg p-4 mb-6 flex gap-3 items-center"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-20"
          >
            <Loader className="w-10 h-10 animate-spin text-cyan-400" />
          </motion.div>
        ) : approvals.length === 0 ? (
          /* No Approvals State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-12 text-center"
          >
            <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Pending Approvals</h3>
            <p className="text-blue-200">All registration requests have been processed.</p>
          </motion.div>
        ) : (
          /* Approvals Grid */
          <div className="space-y-4">
            {approvals.map((approval, index) => (
              <motion.div
                key={approval.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{approval.user_name}</h3>
                    <div className="space-y-1 mt-2">
                      <p className="text-blue-300 text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {approval.user_email}
                      </p>
                      <p className="text-blue-300 text-sm flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {approval.user_phone}
                      </p>
                      <p className="text-blue-400 text-xs mt-2">
                        📅 Requested: {new Date(approval.requested_at).toLocaleDateString()} at{' '}
                        {new Date(approval.requested_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {approval.status === 'approved' ? (
                    <motion.span
                      whileHover={{ scale: 1.02 }}
                      className="px-4 py-2 bg-green-600/20 border border-green-600/50 text-green-200 text-xs font-semibold rounded-full whitespace-nowrap ml-4"
                    >
                      Approved
                    </motion.span>
                  ) : approval.status === 'rejected' ? (
                    <motion.span
                      whileHover={{ scale: 1.02 }}
                      className="px-4 py-2 bg-red-600/20 border border-red-600/50 text-red-200 text-xs font-semibold rounded-full whitespace-nowrap ml-4"
                    >
                      Rejected
                    </motion.span>
                  ) : (
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 text-xs font-semibold rounded-full whitespace-nowrap ml-4"
                    >
                      Pending
                    </motion.span>
                  )}
                </div>

                {/* Rejection Reason Input */}
                {rejectingUserId === approval.user ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 bg-white/5 border border-white/10 p-4 rounded-lg"
                  >
                    <label className="block text-sm font-medium text-white mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why this registration is being rejected..."
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-blue-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
                      rows="3"
                    />
                  </motion.div>
                ) : null}

                {/* Action Buttons (only for pending requests) */}
                {approval.status === 'pending' && (
                  <div className="flex gap-3 justify-end">
                    {rejectingUserId === approval.user ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setRejectingUserId(null);
                            setRejectionReason('');
                          }}
                          className="px-4 py-2 border border-white/30 text-white rounded-lg hover:bg-white/10 transition"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReject(approval.user)}
                          disabled={processingId === approval.user}
                          className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
                        >
                          {processingId === approval.user ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          Confirm Reject
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setRejectingUserId(approval.user)}
                          disabled={processingId === approval.user}
                          className="px-4 py-2 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/20 transition disabled:opacity-50 flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprove(approval.user)}
                          disabled={processingId === approval.user}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
                        >
                          {processingId === approval.user ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Approve
                        </motion.button>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useDistributionChannel } from '@/contexts/DistributionChannelContext';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, LogOut, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SelectDistributionChannel() {
  const { channels, selectedChannelId, selectChannel } = useDistributionChannel();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const forceSelect = params.get('forceSelect') === 'true';

  useEffect(() => {
    if (user?.isSuperuser) {
      // Superusers are not required to select a distribution channel
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    // If there's already a selected channel and we were NOT forced to show the selector,
    // redirect to dashboard. When forceSelect is true (e.g. right after login), stay on this
    // page so the user can confirm or change the active channel.
    if (selectedChannelId && !forceSelect) {
      navigate('/dashboard');
    }
  }, [selectedChannelId, navigate, forceSelect]);

  const handleSelectChannel = (channelId) => {
    selectChannel(channelId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <Helmet>
        <title>Select Distribution Channel - CDD System</title>
        <meta name="description" content="Choose your active distribution channel to continue" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0F2027] to-[#2C5364] px-8 py-10 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Select Distribution Channel</h1>
                <p className="text-blue-100 mt-1">Choose the channel to manage</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            {channels.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="mb-4 text-lg text-gray-600">No distribution channels available for your account.</p>
                <p className="text-sm text-gray-500">Please contact your administrator to be assigned to a channel.</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-6">
                  You have access to {channels.length} distribution channel{channels.length !== 1 ? 's' : ''}. Select one to continue:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {channels.map((channel, index) => (
                    <motion.button
                      key={channel.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => handleSelectChannel(channel.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative text-left px-6 py-4 border-2 rounded-xl transition-all duration-300 ${
                        selectedChannelId === channel.id
                          ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition">
                            {channel.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {channel.channel_type_display || channel.channel_type}
                          </p>
                        </div>
                        {selectedChannelId === channel.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-3 flex-shrink-0"
                          >
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {selectedChannelId && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    onClick={() => navigate('/dashboard')}
                    className="w-full mt-8 px-6 py-3 bg-gradient-to-r from-[#0F2027] to-[#2C5364] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    Continue to Dashboard
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                )}

                <p className="text-xs text-gray-500 text-center mt-6">
                  Your selection determines which channel's data you can access.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-8 py-4 bg-gray-50 flex justify-end">
            <button
              type="button"
              onClick={() => {
                selectChannel(null);
                logout();
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-50 border border-red-300 text-red-700 hover:bg-red-100 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
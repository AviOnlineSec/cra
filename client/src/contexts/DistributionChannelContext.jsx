import React, { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '@/api/axios';

const DistributionChannelContext = createContext(null);

export const useDistributionChannel = () => {
  const ctx = useContext(DistributionChannelContext);
  if (!ctx) throw new Error('useDistributionChannel must be used within DistributionChannelProvider');
  return ctx;
};

export const DistributionChannelProvider = ({ children }) => {
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(() => {
    const saved = localStorage.getItem('cdd_channel_id');
    return saved ? parseInt(saved, 10) : null;
  });

  useEffect(() => {
    // Only fetch channels if user is authenticated
    const accessToken = localStorage.getItem('cdd_access_token');
    if (accessToken) {
      axiosInstance
        .get('/api/distribution-channels/')
        .then((res) => setChannels(res.data || []))
        .catch(() => setChannels([]));
    }
  }, []);

  const selectChannel = (channelId) => {
    setSelectedChannelId(channelId || null);
    if (channelId) {
      localStorage.setItem('cdd_channel_id', String(channelId));
    } else {
      localStorage.removeItem('cdd_channel_id');
    }
  };

  return (
    <DistributionChannelContext.Provider value={{ channels, selectedChannelId, selectChannel }}>
      {children}
    </DistributionChannelContext.Provider>
  );
};
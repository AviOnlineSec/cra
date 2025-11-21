
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useDistributionChannel } from '@/contexts/DistributionChannelContext';
import { LayoutDashboard, FileQuestion, Users, CheckSquare, FileText, LogOut, Shield, FolderKanban, ClipboardList } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { channels, selectedChannelId, selectChannel } = useDistributionChannel();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'compliance', 'user'] },
    { icon: FolderKanban, label: 'Categories', path: '/categories', roles: ['admin', 'compliance'] },
    { icon: FileQuestion, label: 'Questions', path: '/questions', roles: ['admin', 'compliance'] },
    { icon: Users, label: 'Clients', path: '/clients', roles: ['admin', 'compliance', 'user'] },
    { icon: ClipboardList, label: 'Assessments', path: '/assessments', roles: ['admin', 'compliance', 'user'] },
    { icon: CheckSquare, label: 'Approvals', path: '/approvals', roles: ['admin', 'compliance'] },
    { icon: FileText, label: 'Reports', path: '/reports', roles: ['admin', 'compliance'] }
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen flex bg-slate-50">
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 bg-gradient-to-b from-[#0F2027] to-[#2C5364] text-white flex flex-col p-4 shadow-2xl"
      >
        <div className="p-2 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">CDD System</h2>
              <p className="text-xs text-blue-200">Risk Assessment</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div>
          {user && (
            <div className="mb-3">
              <label className="text-xs text-blue-200">Distribution Channel</label>
              <select
                className="mt-1 w-full p-2 rounded bg-white/20 text-white"
                value={selectedChannelId || ''}
                onChange={(e) => selectChannel(e.target.value ? parseInt(e.target.value, 10) : null)}
              >
                <option value="">Select channel</option>
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>{ch.name} ({ch.channel_type_display || ch.channel_type})</option>
                ))}
              </select>
            </div>
          )}
          <div className="p-3 bg-white/10 rounded-lg mb-3">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-blue-200 capitalize">{user?.role}</p>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full p-3 bg-white/10 rounded-lg mb-3"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </motion.aside>

      <main className="flex-1 p-8 overflow-auto">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;

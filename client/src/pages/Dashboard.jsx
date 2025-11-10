
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, CheckCircle, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet';
import axiosInstance from "@/api/axios";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClients: 0,
    pendingApprovals: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    recentAssessments: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [clientsRes, assessmentsRes] = await Promise.all([
          axiosInstance.get("/api/clients/"),
          axiosInstance.get("/api/assessments/"),
        ]);

        const clients = clientsRes.data;
        const assessments = assessmentsRes.data;

        const pending = assessments.filter(
          (a) => a.status === "pending"
        ).length;
        // Normalize risk level from API (backend uses `risk_level`)
        const getRisk = (a) => a.risk_level ?? a.riskLevel ?? null;
        const high = assessments.filter((a) => getRisk(a) === "high").length;
        const medium = assessments.filter((a) => getRisk(a) === "medium").length;
        const low = assessments.filter((a) => getRisk(a) === "low").length;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recent = assessments.filter(
          (a) => new Date(a.createdAt) > thirtyDaysAgo
        ).length;

        setStats({
          totalClients: clients.length,
          pendingApprovals: pending,
          highRisk: high,
          mediumRisk: medium,
          lowRisk: low,
          recentAssessments: recent,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        // Optionally, show a toast notification for the error
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const statCards = [
    { title: 'Total Clients', value: stats.totalClients, icon: Users, color: 'from-[#007bff] to-[#0056b3]', bgColor: 'bg-blue-50' }, // Changed to use logo-like blue
    { title: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50' },
    { title: 'High Risk', value: stats.highRisk, icon: AlertTriangle, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50' },
    { title: 'Medium Risk', value: stats.mediumRisk, icon: TrendingUp, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50' },
    { title: 'Low Risk', value: stats.lowRisk, icon: CheckCircle, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
    { title: 'Recent Assessments', value: stats.recentAssessments, icon: FileText, color: 'from-[#007bff] to-[#0056b3]', bgColor: 'bg-blue-50' } // Changed to use logo-like blue
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - CDD System</title>
        <meta name="description" content="Overview of customer due diligence metrics and statistics" />
      </Helmet>
      <Layout>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#007bff] to-[#0056b3] bg-clip-text text-transparent"> {/* Changed to use logo-like blue */}
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">Here's an overview of your CDD system</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden group">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-5 h-5 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {user?.role !== 'user' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="border-0 bg-gradient-to-br from-[#007bff] to-[#0056b3] text-white shadow-xl"> {/* Changed to use logo-like blue */}
                <CardHeader>
                  <CardTitle className="text-2xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-blue-100">
                    • Manage questionnaires and scoring criteria
                  </p>
                  <p className="text-blue-100">
                    • Review pending client approvals
                  </p>
                  <p className="text-blue-100">
                    • Generate compliance reports
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default Dashboard;

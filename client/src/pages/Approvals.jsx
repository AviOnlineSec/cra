
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/api/axios';

const Approvals = () => {
  const [assessments, setAssessments] = useState([]);
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAssessments();
    }
  }, [user]);

  const loadAssessments = async () => {
    try {
      const [assRes, clientsRes] = await Promise.all([
        axiosInstance.get('/api/assessments/'),
        axiosInstance.get('/api/clients/'),
      ]);
      const submitted = (assRes.data || []).filter(a => a.status === 'submitted');
      setClients(clientsRes.data || []);
      setAssessments(submitted);
    } catch (error) {
      console.error("Failed to load assessments", error);
    }
  };

  const clientsMap = useMemo(() => {
    const map = new Map();
    for (const c of clients) {
      const name = c.fullName || c.corporateName || 'Unnamed Client';
      map.set(c.id, name);
    }
    return map;
  }, [clients]);

  const normalizedAssessments = useMemo(() => {
    return assessments.map(a => ({
      id: a.id,
      clientId: a.client,
      clientName: clientsMap.get(a.client) || `Client #${a.client}`,
      submittedBy: a.submitted_by_name || 'N/A',
      submittedAt: a.submitted_at,
      riskLevel: a.risk_level,
      totalScore: typeof a.total_score === 'number' ? a.total_score : null,
    }));
  }, [assessments, clientsMap]);

  const getRiskLevelBadge = (level) => {
    const variants = {
      low: 'success',
      medium: 'warning',
      high: 'destructive',
    };
    return <Badge variant={variants[level] || 'default'}>{level || 'N/A'}</Badge>;
  };
  
  const handleView = (assessmentId) => {
    navigate(`/assessment/view/${assessmentId}`);
  };

  return (
    <>
      <Helmet>
        <title>Approvals - CDD System</title>
        <meta name="description" content="Review and approve client risk assessments." />
      </Helmet>
      <Layout>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Pending Approvals
            </h1>
            <p className="text-gray-600 mt-2">Assessments awaiting review and decision.</p>
          </motion.div>
          
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Client Name</th>
                                    <th scope="col" className="px-6 py-3">Submitted By</th>
                                    <th scope="col" className="px-6 py-3">Submitted On</th>
                                    <th scope="col" className="px-6 py-3">Risk Level</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {normalizedAssessments.map((assessment) => (
                                    <tr key={assessment.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{assessment.clientName}</td>
                                        <td className="px-6 py-4">{assessment.submittedBy}</td>
                                        <td className="px-6 py-4">{assessment.submittedAt ? new Date(assessment.submittedAt).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4">{getRiskLevelBadge(assessment.riskLevel)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <Button variant="ghost" size="sm" onClick={() => handleView(assessment.id)}>
                                                <Eye className="w-4 h-4 mr-2" /> View
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     {assessments.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p>🎉 No pending approvals at the moment. Great job!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
          </motion.div>

        </div>
      </Layout>
    </>
  );
};

export default Approvals;

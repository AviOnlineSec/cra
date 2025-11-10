import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, UploadCloud } from 'lucide-react';
import { Helmet } from 'react-helmet';
import axiosInstance from '@/api/axios';
import { useToast } from '@/components/ui/use-toast';

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [clients, setClients] = useState([]);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('drafts'); // 'drafts' | 'submitted' | 'approved' | 'rejected'
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pushingId, setPushingId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [assRes, clientsRes] = await Promise.all([
          axiosInstance.get('/api/assessments/'),
          axiosInstance.get('/api/clients/'),
        ]);
        setAssessments(assRes.data || []);
        setClients(clientsRes.data || []);
      } catch (error) {
        console.error('Failed to load assessments or clients', error);
      }
    };
    loadData();
    // Read tab from query string (e.g., /assessments?tab=approved)
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'submitted' || tab === 'approved' || tab === 'rejected' || tab === 'drafts') {
      setActiveTab(tab);
    }
  }, [location.search]);

  const clientsMap = useMemo(() => {
    const map = new Map();
    for (const c of clients) {
      const name = c.fullName || c.corporateName || 'Unnamed Client';
      map.set(c.id, name);
    }
    return map;
  }, [clients]);

  const mapAssessment = (a) => ({
    id: a.id,
    clientId: a.client,
    clientName: clientsMap.get(a.client) || `Client #${a.client}`,
  submittedBy: a.submitted_by_name || 'N/A',
    submittedAt: a.submitted_at,
    riskLevel: a.risk_level,
    status: a.status,
    totalScore: typeof a.total_score === 'number' ? a.total_score : null,
  });

  const getDraftTotalScore = (clientId, assessmentId) => {
    try {
      // Prefer assessment-specific meta if present
      if (assessmentId) {
        const metaRaw = localStorage.getItem(`cdd_draft_meta_assessment_${assessmentId}`);
        if (metaRaw) {
          const meta = JSON.parse(metaRaw);
          if (meta && typeof meta === 'object' && typeof meta.totalScore === 'number') return meta.totalScore;
          if (meta && typeof meta === 'object' && meta.responses && typeof meta.responses === 'object') {
            const sum = Object.values(meta.responses).reduce((acc, r) => acc + (Number(r?.score) || 0), 0);
            return sum;
          }
        }
      }

      // Fallback to client-based storage
      const raw = localStorage.getItem(`cdd_draft_responses_client_${clientId}`);
      if (!raw) return null;
      const saved = JSON.parse(raw);
      if (saved && typeof saved === 'object') {
        if (typeof saved.totalScore === 'number') return saved.totalScore;
        const respObj = saved.responses && typeof saved.responses === 'object' ? saved.responses : saved;
        const sum = Object.values(respObj).reduce((acc, r) => acc + (Number(r?.score) || 0), 0);
        return sum;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const drafts = useMemo(() => assessments
    .filter(a => a.status === 'pending')
    .map(a => ({ ...mapAssessment(a), totalScore: getDraftTotalScore(a.client, a.id) })), [assessments, clientsMap]);
  const submitted = useMemo(() => assessments.filter(a => a.status === 'submitted').map(mapAssessment), [assessments, clientsMap]);
  const approved = useMemo(() => assessments.filter(a => a.status === 'approved').map(mapAssessment), [assessments, clientsMap]);
  const rejected = useMemo(() => assessments.filter(a => a.status === 'rejected').map(mapAssessment), [assessments, clientsMap]);

  const pushAssessment = async (assessmentId) => {
    try {
      setPushingId(assessmentId);
      const res = await axiosInstance.post(`/api/assessments/${assessmentId}/push-external/`);
      toast({
        title: 'Pushed to external',
        description: `Assessment #${res.data?.assessmentId} pushed. External: ${res.data?.externalPushed ? 'yes' : 'no'}`,
      });
    } catch (err) {
      console.error('Push to external failed', err);
      toast({ title: 'Push failed', description: 'Could not push assessment.', variant: 'destructive' });
    } finally {
      setPushingId(null);
    }
  };

  const getRiskLevelBadge = (level) => {
    const variants = {
      low: 'success',
      medium: 'warning',
      high: 'destructive',
    };
    return <Badge variant={variants[level] || 'default'}>{level || 'N/A'}</Badge>;
  };

  const TabButton = ({ id, label }) => (
    <Button
      variant={activeTab === id ? 'default' : 'outline'}
      onClick={() => setActiveTab(id)}
      className={activeTab === id ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}
    >
      {label}
    </Button>
  );

  const Table = ({ rows, emptyText, mode }) => (
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
                <th scope="col" className="px-6 py-3">Total Score</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((assessment) => (
                <tr key={assessment.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{assessment.clientName}</td>
                  <td className="px-6 py-4">{assessment.submittedBy}</td>
                  <td className="px-6 py-4">{assessment.submittedAt ? new Date(assessment.submittedAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4">{getRiskLevelBadge(assessment.riskLevel)}</td>
                  <td className="px-6 py-4">{assessment.totalScore ?? 'N/A'}</td>
                  <td className="px-6 py-4 text-center">
                    {mode === 'drafts' ? (
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/assessment/${assessment.clientId}`)}>
                        <Eye className="w-4 h-4 mr-2" /> Resume
                      </Button>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/assessment/view/${assessment.id}`)}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                        {(mode === 'approved' || mode === 'rejected') && (
                          <Button
                            variant="default"
                            size="sm"
                            className="ml-2 bg-gradient-to-r from-blue-600 to-indigo-600"
                            onClick={() => pushAssessment(assessment.id)}
                            disabled={pushingId === assessment.id}
                          >
                            <UploadCloud className="w-4 h-4 mr-2" /> {pushingId === assessment.id ? 'Pushing...' : 'Push'}
                          </Button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>{emptyText}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Assessments - CDD System</title>
        <meta name="description" content="View draft and submitted assessments." />
      </Helmet>
      <Layout>
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Assessments
            </h1>
            <p className="text-gray-600 mt-2">Manage draft and submitted assessments.</p>
          </motion.div>

          <div className="flex gap-2">
            <TabButton id="drafts" label={`Drafts (${drafts.length})`} />
            <TabButton id="submitted" label={`Submitted (${submitted.length})`} />
            <TabButton id="approved" label={`Approved (${approved.length})`} />
            <TabButton id="rejected" label={`Rejected (${rejected.length})`} />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {activeTab === 'drafts' && (
              <Table rows={drafts} emptyText="No drafts saved yet." mode="drafts" />
            )}
            {activeTab === 'submitted' && (
              <Table rows={submitted} emptyText="No submitted assessments." mode="submitted" />
            )}
            {activeTab === 'approved' && (
              <Table rows={approved} emptyText="No approved assessments." mode="approved" />
            )}
            {activeTab === 'rejected' && (
              <Table rows={rejected} emptyText="No rejected assessments." mode="rejected" />
            )}
          </motion.div>
        </div>
      </Layout>
    </>
  );
};

export default Assessments;
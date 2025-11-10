import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Download, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import axiosInstance from '@/api/axios';

const ViewAssessment = () => {
  const { assessmentId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [answers, setAnswers] = useState([]);
  const [questionsMap, setQuestionsMap] = useState({});
  const [categoriesMap, setCategoriesMap] = useState({});

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        const res = await axiosInstance.get(`/api/assessments/${assessmentId}/`);
        const a = res.data;

        // Fetch client name
        let clientName = `Client #${a.client}`;
        try {
          const clientRes = await axiosInstance.get(`/api/clients/${a.client}/`);
          const c = clientRes.data;
          clientName = c.fullName || c.corporateName || clientName;
        } catch (e) {
          // ignore; fallback already set
        }

        // Load answers and metadata needed to display them
        let answersData = [];
        let qMap = {};
        let cMap = {};
        try {
          const [answersRes, questionsRes, categoriesRes] = await Promise.all([
            axiosInstance.get(`/api/answers/?assessment=${assessmentId}`),
            axiosInstance.get('/api/questions/'),
            axiosInstance.get('/api/categories/'),
          ]);
          answersData = answersRes.data || [];
          qMap = (questionsRes.data || []).reduce((acc, q) => { acc[q.id] = q; return acc; }, {});
          cMap = (categoriesRes.data || []).reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
        } catch (e) {
          // If answers or metadata fail to load, proceed with core assessment details
          console.warn('Loading answers or metadata failed', e);
        }

        const totalScore = answersData.reduce((sum, a) => sum + (a.score_value || 0), 0) || a.total_score || null;
        const grouped = {};
        answersData.forEach(aItem => {
          const q = qMap[aItem.question];
          const catId = q?.category ?? q?.category_id;
          const catName = cMap[catId]?.name || `Category #${catId || 'N/A'}`;
          if (!grouped[catName]) grouped[catName] = [];
          grouped[catName].push({
            questionText: q?.question_text || `Question #${aItem.question}`,
            selectedText: aItem.selected_text,
            scoreValue: aItem.score_value,
          });
        });

        const normalized = {
          id: a.id,
          clientName,
          totalScore: totalScore || null,
          riskLevel: a.risk_level,
          status: a.status,
    submittedBy: a.submitted_by_name || 'N/A',
          approvedAt: null,
          approvalNotes: '',
          submittedAt: a.submitted_at,
          groupedResponses: grouped,
        };
        setAssessment(normalized);
        setAnswers(answersData);
        setQuestionsMap(qMap);
        setCategoriesMap(cMap);
      } catch (error) {
        console.error('Failed to load assessment', error);
        const status = error?.response?.status;
        const message = status === 404 ? 'Assessment not found.' : status === 401 ? 'Please log in again.' : 'Server error loading assessment.';
        toast({ title: 'Error', description: message, variant: 'destructive' });
        navigate('/assessments');
      }
    };
    loadAssessment();
  }, [assessmentId, navigate, toast]);

  const handleApproval = async (isApproved) => {
    if ((user.role !== 'admin' && user.role !== 'compliance')) {
      toast({ title: 'Unauthorized', description: 'Only Admin or Compliance can approve.', variant: 'destructive' });
      return;
    }

    try {
      await axiosInstance.patch(`/api/assessments/${assessmentId}/`, {
        status: isApproved ? 'approved' : 'rejected',
      });
      toast({ title: 'Success', description: `Assessment has been ${isApproved ? 'approved' : 'rejected'}.` });
      // After approval/rejection, route to Assessments with the relevant tab
      navigate(isApproved ? '/assessments?tab=approved' : '/assessments?tab=submitted');
    } catch (error) {
      console.error('Failed to update assessment status', error);
      const status = error?.response?.status;
      const message = status === 401 ? 'Please log in again.' : status === 404 ? 'Assessment not found.' : 'Server error while updating.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-700',
      submitted: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'}
      </span>
    );
  };
  
  const getRiskLevelBadge = (level) => {
    if (!level) return null;
    const styles = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[level]}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)} Risk
      </span>
    );
  };
  
  const downloadReport = () => {
    toast({
        title: 'Coming Soon!',
        description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  }

  if (!assessment) {
    return <Layout><div className="text-center p-8">Loading assessment...</div></Layout>;
  }

  return (
    <>
      <Helmet>
        <title>View Assessment - {assessment.clientName}</title>
      </Helmet>
      <Layout>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
            <Button onClick={downloadReport} className="bg-slate-700 hover:bg-slate-800"><Download className="w-4 h-4 mr-2" /> Download Report</Button>
          </div>

          <div className="bg-white rounded-xl shadow-lg max-w-5xl mx-auto">
            <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-slate-800">Assessment Details</h2>
                <p className="text-slate-600">Client: {assessment.clientName}</p>
            </div>
            <div className="p-6 space-y-8">
                {/* --- Summary Section --- */}
                <div className="bg-slate-50 p-6 rounded-xl space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><p className="text-sm text-slate-600">Total Score</p><p className="text-2xl font-bold">{assessment.totalScore ?? 'N/A'}</p></div>
                        <div><p className="text-sm text-slate-600">Risk Level</p><div className="mt-1">{getRiskLevelBadge(assessment.riskLevel)}</div></div>
                        <div><p className="text-sm text-slate-600">Status</p><div className="mt-1">{getStatusBadge(assessment.status)}</div></div>
                        <div><p className="text-sm text-slate-600">Submitted By</p><p className="font-medium">{assessment.submittedBy}</p></div>
                    </div>
                </div>

                {/* --- Responses Section --- */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-800">Assessment Responses</h3>
                    {Object.keys(assessment.groupedResponses || {}).length === 0 ? (
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-slate-600">No responses available.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(assessment.groupedResponses).map(([categoryName, items]) => (
                          <div key={categoryName} className="bg-slate-50 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-slate-700 mb-2">{categoryName}</h4>
                            <ul className="space-y-2">
                              {items.map((it, idx) => (
                                <li key={idx} className="flex items-start justify-between gap-4">
                                  <span className="text-slate-800">{it.questionText}</span>
                                  <span className="text-slate-600">Answer: <span className="font-medium">{it.selectedText || '—'}</span></span>
                                  <span className="text-slate-600">Score: <span className="font-medium">{it.scoreValue}</span></span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                {/* --- Approval Section --- */}
                {assessment.status === 'submitted' && (user.role === 'admin' || user.role === 'compliance') && (
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Approval Decision</h3>
                        <div className="flex space-x-3">
                            <Button onClick={() => handleApproval(true)} className="bg-green-600 hover:bg-green-700"><CheckCircle size={18} className="mr-2"/>Approve</Button>
                            <Button onClick={() => handleApproval(false)} variant="destructive"><XCircle size={18} className="mr-2"/>Reject</Button>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </motion.div>
      </Layout>
    </>
  );
};

export default ViewAssessment;

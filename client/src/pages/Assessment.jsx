
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Send, ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet';
import axiosInstance from '@/api/axios';

const Assessment = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [client, setClient] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);

  // Local storage key to persist and resume draft responses per client
  const draftKey = useMemo(() => `cdd_draft_responses_client_${clientId}`, [clientId]);
  const draftMapKey = useMemo(() => `cdd_draft_map_client_${clientId}`, [clientId]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [clientRes, questionsRes, categoriesRes] = await Promise.all([
          axiosInstance.get(`/api/clients/${clientId}/`),
          axiosInstance.get('/api/questions/'),
          axiosInstance.get('/api/categories/'),
        ]);

        const clientData = clientRes.data;
        // Preserve existing UI usage of client.name by deriving it from API fields
        const derivedName = clientData.fullName || clientData.corporateName || 'Unnamed Client';
        setClient({ ...clientData, name: derivedName });

        const normalizedQuestions = (questionsRes.data || []).map(q => ({
          ...q,
          category_id: q.category ?? q.category_id,
        }));
        setQuestions(normalizedQuestions);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Failed to load assessment data', error);
        const status = error?.response?.status;
        if (status === 401) {
          toast({ title: 'Session expired', description: 'Please log in again.', variant: 'destructive' });
          navigate('/login');
        } else if (status === 404) {
          toast({ title: 'Client not found', description: 'The selected client does not exist.', variant: 'destructive' });
          navigate('/clients');
        } else {
          toast({ title: 'Network error', description: 'Unable to reach the server. Check backend and CORS.', variant: 'destructive' });
          navigate('/clients');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clientId, navigate, toast]);

  // Load saved draft responses if available (resume progress)
  useEffect(() => {
    try {
      // Prefer assessment-specific meta if a mapping exists
      const mappedAssessmentId = localStorage.getItem(draftMapKey);
      if (mappedAssessmentId) {
        const metaRaw = localStorage.getItem(`cdd_draft_meta_assessment_${mappedAssessmentId}`);
        if (metaRaw) {
          const meta = JSON.parse(metaRaw);
          if (meta && typeof meta === 'object' && meta.responses && typeof meta.responses === 'object') {
            setResponses(meta.responses);
            return; // Loaded successfully from assessment-specific meta
          }
        }
      }

      // Fallback to client-based key
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const saved = JSON.parse(raw);
        // Backward compatibility: saved might be just responses object or { responses, totalScore }
        if (saved && typeof saved === 'object') {
          if (saved.responses && typeof saved.responses === 'object') {
            setResponses(saved.responses);
          } else {
            setResponses(saved);
          }
        }
      }
    } catch (e) {
      // ignore JSON parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey, draftMapKey]);

  
  
  const handleResponseChange = (questionId, optionText, score) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { answer: optionText, score: Number(score) },
    }));
  };

  const totalScore = useMemo(() => {
    return Object.values(responses).reduce((sum, resp) => sum + (resp.score || 0), 0);
  }, [responses]);

  const maxScore = useMemo(() => {
    return questions.reduce((sum, q) => {
      const maxOptScore = q.options?.reduce((max, opt) => Math.max(max, opt.score_value || 0), 0);
      return sum + (maxOptScore || 0);
    }, 0);
  }, [questions]);

  const getRiskLevel = (score) => {
    const highThreshold = 70;
    const mediumThreshold = 40;
    
    if (score >= highThreshold) return 'high';
    if (score >= mediumThreshold) return 'medium';
    return 'low';
  };

  const progressPercent = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const riskLevel = getRiskLevel(totalScore);

  // Persist responses and totalScore continuously for resume
  useEffect(() => {
    try {
      const meta = { responses, totalScore };
      localStorage.setItem(draftKey, JSON.stringify(meta));

      // If we have a mapped assessment id, also persist under assessment-specific key
      const mappedAssessmentId = localStorage.getItem(draftMapKey);
      if (mappedAssessmentId) {
        localStorage.setItem(`cdd_draft_meta_assessment_${mappedAssessmentId}`, JSON.stringify(meta));
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [responses, totalScore, draftKey, draftMapKey]);

  const saveAssessment = async (status) => {
    try {
      const payload = {
        client: client.id,
        status: status === 'submitted' ? 'submitted' : 'pending',
        risk_level: riskLevel,
        total_score: totalScore,
      };
      // If we already have a draft mapped, update it instead of creating a new one
      const existingAssessmentId = localStorage.getItem(draftMapKey);
      let resp;
      if (existingAssessmentId) {
        resp = await axiosInstance.patch(`/api/assessments/${existingAssessmentId}/`, payload);
      } else {
        resp = await axiosInstance.post('/api/assessments/', payload);
      }

      // Build answers payload from current responses
      const created = resp?.data;
      const answersList = Object.entries(responses || {}).map(([qid, r]) => ({
        question: Number(qid),
        selected_text: r?.answer || '',
        score_value: typeof r?.score === 'number' ? r.score : Number(r?.score || 0),
      }));

      // Persist answers server-side by replacing any existing ones for this assessment
      if (created && created.id && answersList.length > 0) {
        try {
          await axiosInstance.post('/api/answers/replace/', {
            assessment: created.id,
            answers: answersList,
          });
        } catch (e) {
          console.warn('Saving answers failed; proceeding anyway', e);
        }
      }

      toast({
        title: "Success!",
        description: `Assessment has been ${status}.`
      });

      if (status === 'submitted') {
        // Clear any saved draft progress upon submission
        try {
          localStorage.removeItem(draftKey);
          const mappedAssessmentId = localStorage.getItem(draftMapKey);
          if (mappedAssessmentId) {
            localStorage.removeItem(`cdd_draft_meta_assessment_${mappedAssessmentId}`);
            localStorage.removeItem(draftMapKey);
          }
        } catch (e) {}
        navigate('/approvals');
      } else {
        // For drafts, record the mapping and persist meta under assessment-specific key
        try {
          if (created && created.id) {
            localStorage.setItem(draftMapKey, String(created.id));
            const meta = { responses, totalScore };
            localStorage.setItem(`cdd_draft_meta_assessment_${created.id}`, JSON.stringify(meta));
          }
        } catch (e) {}
        navigate('/assessments');
      }
    } catch (error) {
      console.error('Failed to save assessment', error);
      const statusCode = error?.response?.status;
      const message = statusCode === 401
        ? 'Please log in again.'
        : statusCode === 400
          ? 'Invalid assessment data.'
          : 'Server unavailable or network error.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  if (loading || !client) {
    return <Layout><div className="text-center p-8">Loading...</div></Layout>;
  }

  return (
    <>
      <Helmet>
        <title>Risk Assessment - {client.name}</title>
      </Helmet>
      <Layout>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-2xl max-w-5xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm rounded-t-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Risk Assessment</h1>
                <p className="text-slate-600">Client: {client.name}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
            {/* Score Display */}
            <div className="p-4 space-y-2">
              <div className="flex justify-between font-medium">
                  <span>Total Score: <span className="font-bold text-blue-600">{totalScore}</span></span>
                  <span>Risk Level: <span className={`font-bold uppercase ${riskLevel === 'high' ? 'text-red-600' : riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>{riskLevel}</span></span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${riskLevel === 'high' ? 'bg-red-500' : riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} 
                    style={{ width: `${progressPercent}%`}}
                  ></div>
              </div>
            </div>
          </div>
          
          {/* Questions */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {categories.map(category => {
              const categoryQuestions = questions.filter(q => q.category_id === category.id);
              if (categoryQuestions.length === 0) return null;

              return (
                <div key={category.id}>
                  <h2 className="text-xl font-semibold text-slate-700 border-b-2 border-blue-500 pb-2 mb-4">{category.name}</h2>
                  <div className="space-y-4">
                    {categoryQuestions.sort((a,b) => a.display_order - b.display_order).map(q => (
                      <div key={q.id} className="bg-slate-50 p-4 rounded-lg shadow-sm">
                        <label className="block text-sm font-medium text-slate-800 mb-2">{q.question_text}</label>
                        <select 
                          className="w-full p-2 border border-slate-300 rounded-md"
                          value={responses[q.id]?.answer || ''}
                          onChange={(e) => {
                              const selectedOption = q.options.find(opt => opt.option_text === e.target.value);
                              handleResponseChange(q.id, selectedOption.option_text, selectedOption.score_value);
                          }}
                        >
                            <option value="" disabled>Select an option</option>
                            {q.options.sort((a,b) => a.display_order - b.display_order).map((opt, i) => (
                                <option key={i} value={opt.option_text}>
                                    {opt.option_text} (Score: {opt.score_value})
                                </option>
                            ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 p-4 border-t bg-slate-50 rounded-b-xl sticky bottom-0">
            <Button variant="outline" onClick={() => saveAssessment('draft')}><Save className="w-4 h-4 mr-2" /> Save as Draft</Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={() => saveAssessment('submitted')}><Send className="w-4 h-4 mr-2" /> Submit for Approval</Button>
          </div>
        </motion.div>
      </Layout>
    </>
  );
};

export default Assessment;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Helmet } from 'react-helmet';
import { useToast } from '@/components/ui/use-toast';
import { getMonthlyReport, getYearlyReport } from '../api/reports';

const Reports = () => {
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [yearlyReport, setYearlyReport] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const { toast } = useToast();

  const handleMonthlyReport = async () => {
    try {
      const report = await getMonthlyReport(startDate, endDate);
      setMonthlyReport(report);
    } catch (err) {
      console.error('Monthly report error', err);
      toast({ title: 'Error', description: 'Failed to generate monthly report', variant: 'destructive' });
    }
  };

  const handleYearlyReport = async () => {
    try {
      const report = await getYearlyReport(startYear, endYear);
      setYearlyReport(report);
    } catch (err) {
      console.error('Yearly report error', err);
      toast({ title: 'Error', description: 'Failed to generate yearly report', variant: 'destructive' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Reports - CDD System</title>
        <meta name="description" content="Generate monthly and yearly reports" />
      </Helmet>
      <Layout>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Reports & Analytics
              </h1>
              <p className="text-gray-600 mt-2">Generate monthly and yearly summaries with detailed fields</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Monthly Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleMonthlyReport} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  Generate
                </Button>
                {monthlyReport && (
                  <div className="mt-4 space-y-6">
                    {/* Summary cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(monthlyReport.summary || monthlyReport).map(([month, count]) => (
                        <div key={month} className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">{month}</p>
                          <p className="text-2xl font-bold text-slate-800">{count}</p>
                        </div>
                      ))}
                    </div>
                    {/* Details table */}
                    {Array.isArray(monthlyReport.details) && monthlyReport.details.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg shadow">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Client Reference</th>
                              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Client Name</th>
                              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Score Level</th>
                              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Total Score</th>
                              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Approval Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {monthlyReport.details.map((row, idx) => (
                              <tr key={idx} className="border-t">
                                <td className="px-6 py-3 text-sm">{row.client_reference || '—'}</td>
                                <td className="px-6 py-3 text-sm">{row.client_name || '—'}</td>
                                <td className="px-6 py-3 text-sm capitalize">{row.score_level || '—'}</td>
                                <td className="px-6 py-3 text-sm">{typeof row.total_score === 'number' ? row.total_score : '—'}</td>
                                <td className="px-6 py-3 text-sm capitalize">{row.approval_status || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Yearly Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Start Year</Label>
                    <Input type="number" placeholder="2023" value={startYear} onChange={(e) => setStartYear(e.target.value)} />
                  </div>
                  <div>
                    <Label>End Year</Label>
                    <Input type="number" placeholder="2025" value={endYear} onChange={(e) => setEndYear(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleYearlyReport} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  Generate
                </Button>
                {yearlyReport && (
                  <div className="mt-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(yearlyReport.summary || yearlyReport).map(([year, count]) => (
                        <div key={year} className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">{year}</p>
                          <p className="text-2xl font-bold text-slate-800">{count}</p>
                        </div>
                      ))}
                    </div>
                    {Array.isArray(yearlyReport.details) && yearlyReport.details.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg shadow">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Client Reference</th>
                              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Client Name</th>
                              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Score Level</th>
                              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Total Score</th>
                              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Approval Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {yearlyReport.details.map((row, idx) => (
                              <tr key={idx} className="border-t">
                                <td className="px-6 py-3 text-sm">{row.client_reference || '—'}</td>
                                <td className="px-6 py-3 text-sm">{row.client_name || '—'}</td>
                                <td className="px-6 py-3 text-sm capitalize">{row.score_level || '—'}</td>
                                <td className="px-6 py-3 text-sm">{typeof row.total_score === 'number' ? row.total_score : '—'}</td>
                                <td className="px-6 py-3 text-sm capitalize">{row.approval_status || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
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

export default Reports;

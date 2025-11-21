import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/api/axios';

export default function KycUpload() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error' | null
  const [message, setMessage] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState([]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get('/api/clients/');
      setClients(response.data || []);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const fetchUploadedDocs = async (clientId) => {
    try {
      const response = await axiosInstance.get(`/api/kyc-documents/?client=${clientId}`);
      setUploadedDocs(response.data || []);
    } catch (error) {
      console.error('Failed to fetch uploaded documents:', error);
    }
  };

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    setSelectedClient(clientId);
    if (clientId) {
      fetchUploadedDocs(clientId);
    } else {
      setUploadedDocs([]);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadStatus(null);
    setMessage('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedClient) {
      setUploadStatus('error');
      setMessage('Please select a client');
      return;
    }
    
    if (!file) {
      setUploadStatus('error');
      setMessage('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadStatus(null);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('client', selectedClient);
      formData.append('document', file);

      const response = await axiosInstance.post('/api/kyc-documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadStatus('success');
      setMessage(`Document "${file.name}" uploaded successfully!`);
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';

      // Refresh the uploaded documents list
      fetchUploadedDocs(selectedClient);
    } catch (error) {
      setUploadStatus('error');
      setMessage(error.response?.data?.detail || 'Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
      <Helmet>
        <title>KYC Document Upload - CDD System</title>
        <meta name="description" content="Upload KYC documents for clients" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0F2027] to-[#2C5364] px-8 py-10 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">KYC Document Upload</h1>
                  <p className="text-blue-100 mt-1">Upload client KYC documentation</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/clients')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Clients
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            <form onSubmit={handleUpload} className="space-y-6">
              {/* Client Selection */}
              <div>
                <label htmlFor="client-select" className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Client *
                </label>
                <select
                  id="client-select"
                  value={selectedClient}
                  onChange={handleClientChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  required
                >
                  <option value="">-- Choose a client --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.fullName || client.corporateName} ({client.reference})
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label htmlFor="file-input" className="block text-sm font-semibold text-gray-700 mb-2">
                  Choose Document *
                </label>
                <div className="relative">
                  <input
                    id="file-input"
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                </p>
              </div>

              {/* Selected File Info */}
              {file && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl"
                >
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </motion.div>
              )}

              {/* Status Messages */}
              {uploadStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-800">{message}</p>
                </motion.div>
              )}

              {uploadStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-medium text-red-800">{message}</p>
                </motion.div>
              )}

              {/* Upload Button */}
              <button
                type="submit"
                disabled={uploading || !selectedClient || !file}
                className={`w-full px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                  uploading || !selectedClient || !file
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#0F2027] to-[#2C5364] hover:shadow-lg'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Document
                  </>
                )}
              </button>
            </form>

            {/* Uploaded Documents List */}
            {uploadedDocs.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Previously Uploaded Documents ({uploadedDocs.length})
                </h3>
                <div className="space-y-3">
                  {uploadedDocs.map((doc) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.original_filename}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded on {new Date(doc.upload_date).toLocaleDateString()} at{' '}
                            {new Date(doc.upload_date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        View
                      </a>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Document Organization</p>
                <p>
                  Files are automatically organized by client name and upload date. Each document is stored securely
                  and can be accessed later for compliance and auditing purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

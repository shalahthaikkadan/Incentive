// src/components/IconCard.jsx
import React, { useState, useRef } from 'react';
import api from '../api';
import { UploadCloud, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

function IconCard({ icon, title, description, endpoint, type, singleFile = false }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState(`Click to select ${singleFile ? 'a file' : 'one or more files'}.`);
  const [warnings, setWarnings] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) handleSubmit(selectedFiles);
  };

  const handleSubmit = async (selectedFiles) => {
    setStatus('uploading');
    setMessage(`Uploading ${selectedFiles.length} file(s)...`);
    setWarnings([]);

    const formData = new FormData();
    if (type) formData.append('type', type);

    if (singleFile) {
      formData.append('file', selectedFiles[0]);
    } else {
      for (let i = 0; i < selectedFiles.length; i++) formData.append('files', selectedFiles[i]);
    }

    try {
      const res = await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage(res.data.message || 'Upload processed.');
      
      if (res.data.warnings && res.data.warnings.length > 0) {
        setStatus('warning');
        setWarnings(res.data.warnings);
      } else {
        setStatus('success');
      }
    } catch (err) {
      setStatus('error');
      // FIXED: Better error message handling
      const errorData = err.response?.data?.error;
      let errorMessage = 'An unknown error occurred.';
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (Array.isArray(errorData)) {
        errorMessage = errorData.join(' ');
      }
      setMessage(errorMessage);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => {
        setStatus('idle');
        setMessage(`Click to select ${singleFile ? 'a file' : 'one or more files'}.`);
        setWarnings([]);
      }, 8000);
    }
  };

  const triggerFileSelect = () => {
    if (status === 'uploading') return;
    fileInputRef.current.click();
  };

  const statusClasses = {
    idle: 'text-gray-500',
    uploading: 'text-blue-600',
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
  };

  const statusIcon = {
    idle: <UploadCloud className="w-5 h-5 mr-2 flex-shrink-0" />,
    uploading: <UploadCloud className="animate-spin w-5 h-5 mr-2 flex-shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />,
    warning: <Info className="w-5 h-5 mr-2 flex-shrink-0" />,
  };

  return (
    <div onClick={triggerFileSelect} className="bg-white p-6 rounded-2xl shadow-lg border border-transparent hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls, .csv" className="hidden" disabled={status === 'uploading'} multiple={!singleFile} />
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 text-white p-4 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300">{icon}</div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-dashed">
        <div className={`flex items-center text-sm font-medium ${statusClasses[status]}`}>
          {statusIcon[status]}
          <p className="truncate" title={message}>{message}</p>
        </div>
        {warnings.length > 0 && (
          <div className="mt-2 text-xs text-gray-600 bg-yellow-50 p-2 rounded-md">
            {warnings.map((warn, i) => (
              <p key={i}>{warn}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default IconCard;

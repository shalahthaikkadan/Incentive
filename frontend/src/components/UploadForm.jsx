// src/components/UploadForm.jsx
import React, { useState, useRef } from 'react';
import api from '../api';

/**
 * A reusable component for handling file uploads.
 * It's used for the Employee Master, Incentives, and Deductions sheets.
 * @param {string} title - The title displayed on the card.
 * @param {string} endpoint - The API endpoint to send the file to.
 * @param {string} [type] - Optional type ('incentive' or 'deduction') for component sheets.
 * @param {function} onUploadSuccess - A callback function to run after a successful upload.
 */
function UploadForm({ title, endpoint, type, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null); // To reset the file input

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    if (type) {
      formData.append('type', type);
    }

    try {
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(res.data.message || 'Upload successful!');
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFile(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          <button
            type="submit"
            disabled={isUploading || !file}
            className="mt-4 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
      <div className="mt-4 h-5">
        {message && <p className="text-sm text-green-600 animate-pulse">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

export default UploadForm;

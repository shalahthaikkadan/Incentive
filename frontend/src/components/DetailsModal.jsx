// src/components/DetailsModal.jsx
import React from 'react';
import { X, FileText, Paperclip } from 'lucide-react';
import api from '../api';

function DetailsModal({ isOpen, onClose, title, components }) {
  if (!isOpen) return null;

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  
  // Construct the base URL for media files from the api instance
  const serverBaseUrl = api.defaults.baseURL.replace('/api', '');

  // A helper component to render the correct source link
  const SourceLink = ({ item }) => {
    // Case 1: Manual entry with an attachment
    if (item.source_file === 'Manual Entry' && item.attachment_url) {
      return (
        <a
          href={`${serverBaseUrl}${item.attachment_url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-xs text-blue-500 hover:text-blue-700 hover:underline mt-1"
        >
          <Paperclip size={12} className="mr-1.5" />
          <span>View Attachment</span>
        </a>
      );
    }
    // Case 2: Uploaded file
    if (item.source_file && item.source_file !== 'Manual Entry') {
      return (
        <a
          href={`${serverBaseUrl}/media/${item.source_file}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-xs text-blue-500 hover:text-blue-700 hover:underline mt-1"
        >
          <FileText size={12} className="mr-1.5" />
          <span>Source: {item.source_file}</span>
        </a>
      );
    }
    // Case 3: Manual entry with no attachment (or any other case)
    return (
      <div className="flex items-center text-xs text-gray-400 mt-1">
        <FileText size={12} className="mr-1.5" />
        <span>Source: Manual Entry</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 m-4">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title} Breakdown</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {components && components.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {components.map((item, index) => (
                <li key={index} className="py-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 capitalize">{item.reason || 'N/A'}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
                  </div>
                  <SourceLink item={item} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-10">No specific items to display.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailsModal;

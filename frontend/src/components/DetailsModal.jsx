// src/components/DetailsModal.jsx
import React from 'react';
import { X, FileText } from 'lucide-react';
import api from '../api'; // Import the api instance to get the baseURL

function DetailsModal({ isOpen, onClose, title, components }) {
  if (!isOpen) return null;

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  
  // Construct the base URL for media files from the api instance
  const mediaBaseUrl = `${api.defaults.baseURL.replace('/api', '')}/media/`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 m-4 transform transition-all scale-95 opacity-0 animate-scale-in">
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
                  {item.source_file && (
                    // MODIFIED: This is now a clickable link that opens in a new tab
                    <a
                      href={`${mediaBaseUrl}${item.source_file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-xs text-blue-500 hover:text-blue-700 hover:underline mt-1"
                    >
                      <FileText size={12} className="mr-1.5" />
                      <span>Source: {item.source_file}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-10">No specific items to display.</p>
          )}
        </div>
      </div>
      <style>{`
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default DetailsModal;

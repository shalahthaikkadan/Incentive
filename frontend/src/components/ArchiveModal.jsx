// src/components/ArchiveModal.jsx
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

function ArchiveModal({ isOpen, onClose, onSave, isArchiving }) {
  const [runName, setRunName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(runName);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Save to History</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Give this payroll run a descriptive name for future reference (e.g., "June 2025 Final Payroll").
        </p>
        <div>
          <label htmlFor="runName" className="block text-sm font-medium text-gray-700 mb-1">
            Payroll Run Name
          </label>
          <input
            type="text"
            id="runName"
            value={runName}
            onChange={(e) => setRunName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter name (optional)"
          />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isArchiving}
            className="inline-flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-5 rounded-md text-sm hover:bg-blue-700 shadow-md disabled:bg-gray-400"
          >
            <Save className="mr-2 h-4 w-4" />
            {isArchiving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ArchiveModal;

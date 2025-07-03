// src/components/History.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { Clock, ChevronDown, ChevronUp, UserCircle, Trash2 } from 'lucide-react';

function History() {
  const [runs, setRuns] = useState([]);
  const [activeRunId, setActiveRunId] = useState(null);
  const [archivedResults, setArchivedResults] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const fetchRuns = async () => {
    try {
      const res = await api.get('/payroll/history/');
      setRuns(res.data);
    } catch (error) {
      console.error("Failed to fetch payroll runs:", error);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const toggleRunDetails = async (runId) => {
    if (activeRunId === runId) {
      setActiveRunId(null);
      return;
    }
    
    setIsLoadingDetails(true);
    setActiveRunId(runId);
    try {
      const res = await api.get(`/payroll/history/${runId}/`);
      setArchivedResults(res.data);
    } catch (error) {
      console.error("Failed to fetch archived results:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // NEW: Handler for the delete button
  const handleDeleteRun = async (runId, event) => {
    event.stopPropagation(); // Prevent the accordion from toggling
    if (window.confirm("Are you sure you want to permanently delete this payroll run? This action cannot be undone.")) {
      try {
        await api.delete(`/payroll/history/${runId}/delete/`);
        alert("Payroll run deleted successfully.");
        fetchRuns(); // Refresh the list of runs
      } catch (error) {
        alert("Failed to delete the payroll run.");
      }
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  return (
    <main className="flex-1 bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Payroll History</h1>
          <p className="text-gray-500 mt-1">Review all previously generated payroll runs.</p>
        </div>
        <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-gray-700">Admin User</span>
            <UserCircle size={36} className="text-gray-400" />
        </div>
      </header>

      <div className="space-y-4">
        {runs.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No historical payroll runs found.</p>
        ) : (
          runs.map(run => (
            <div key={run.id} className="bg-white rounded-lg shadow-md">
              <div className="w-full flex justify-between items-center p-4 text-left">
                <button onClick={() => toggleRunDetails(run.id)} className="flex-grow flex items-center text-left">
                  <Clock className="text-blue-500 mr-3 flex-shrink-0" />
                  <span className="font-semibold text-lg text-gray-700">
                    {/* MODIFIED: Display run name or fallback to timestamp */}
                    {run.run_name || `Payroll Run - ${formatDate(run.run_timestamp)}`}
                  </span>
                </button>
                <div className="flex items-center">
                  {/* NEW: Delete button */}
                  <button onClick={(e) => handleDeleteRun(run.id, e)} className="p-2 text-red-500 hover:bg-red-100 rounded-full mr-2">
                    <Trash2 size={18} />
                  </button>
                  <button onClick={() => toggleRunDetails(run.id)} className="p-2">
                    {activeRunId === run.id ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>
              </div>
              {activeRunId === run.id && (
                <div className="border-t p-4">
                  {isLoadingDetails ? (
                    <p className="text-center text-gray-500 py-4">Loading details...</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            {['Emp ID', 'Name', 'Base Salary', 'Incentives', 'Deductions', 'Final Salary', 'Status'].map(head =>
                              <th key={head} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{head}</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {archivedResults.map(r => (
                            <tr key={r.id}>
                              <td className="px-4 py-2">{r.employee_id}</td>
                              <td className="px-4 py-2">{r.employee_name}</td>
                              <td className="px-4 py-2">{formatCurrency(r.base_salary)}</td>
                              <td className="px-4 py-2 text-green-600">{formatCurrency(r.total_incentives)}</td>
                              <td className="px-4 py-2 text-red-600">{formatCurrency(r.total_deductions)}</td>
                              <td className="px-4 py-2 font-bold">{formatCurrency(r.final_salary)}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  r.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>{r.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}

export default History;

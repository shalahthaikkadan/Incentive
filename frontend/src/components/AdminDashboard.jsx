// src/components/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import IconCard from './IconCard.jsx';
import DetailsModal from './DetailsModal.jsx';
import ArchiveModal from './ArchiveModal.jsx'; // NEW
import { Users, TrendingUp, TrendingDown, ChevronsRight, CheckCircle, XCircle, UserCircle, Search, Filter, Save } from 'lucide-react';

function AdminDashboard() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, title: '', components: [] });
  const [archiveModalOpen, setArchiveModalOpen] = useState(false); // NEW
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/payroll/results/?${params.toString()}`);
      setResults(res.data);
    } catch (err) {
      console.error("Failed to fetch results:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, refreshTrigger]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const handleGenerate = async () => {
    try {
      const res = await api.post('/payroll/generate/');
      alert(res.data.message || 'Payroll generated!');
      setRefreshTrigger(c => c + 1);
    } catch (err) {
      alert('Payroll generation failed.');
    }
  };

  const handleArchive = async (runName) => {
    if (results.length === 0) {
      alert("There are no results to save.");
      return;
    }
    setIsArchiving(true);
    try {
      const res = await api.post('/payroll/archive/', { run_name: runName });
      alert(res.data.message);
      setArchiveModalOpen(false);
      setRefreshTrigger(c => c + 1); // Refresh dashboard to show it's cleared
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save to history.");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleAction = async (action, id) => {
    const reason = rejectionReasons[id] || '';
    if (action === 'reject' && !reason.trim()) {
        alert('Rejection reason cannot be empty.');
        return;
    }
    try {
      const endpoint = action === 'reject' ? `/payroll/reject/${id}/` : `/payroll/approve/${id}/`;
      await api.post(endpoint, { reason });
      fetchResults();
    } catch (err) {
      alert('Action failed.');
    }
  };
  
  const showDetails = (type, components) => {
    setDetailsModal({ isOpen: true, title: type, components: components });
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  
  const FilterButton = ({ value, label }) => (
    <button onClick={() => setStatusFilter(value)} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${ statusFilter === value ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100' }`}>
      {label}
    </button>
  );

  return (
    <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">
      <DetailsModal isOpen={detailsModal.isOpen} onClose={() => setDetailsModal({ isOpen: false, title: '', components: [] })} title={detailsModal.title} components={detailsModal.components} />
      {/* NEW: Render the Archive Modal */}
      <ArchiveModal isOpen={archiveModalOpen} onClose={() => setArchiveModalOpen(false)} onSave={handleArchive} isArchiving={isArchiving} />

      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, Admin!</p>
        </div>
        <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-gray-700">Admin User</span>
            <UserCircle size={36} className="text-gray-400" />
        </div>
      </header>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-700 mb-5">1. Upload Data Files</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <IconCard icon={<Users size={28} />} title="Employee Master" description="Upload employee details." endpoint="/upload/employee/" singleFile={true} />
          <IconCard icon={<TrendingUp size={28} />} title="Incentives" description="Upload bonuses & allowances." endpoint="/upload/component/" type="incentive" />
          <IconCard icon={<TrendingDown size={28} />} title="Deductions" description="Upload advances & loans." endpoint="/upload/component/" type="deduction" />
        </div>
      </section>

      <section className="text-center mb-12">
        <h2 className="text-xl font-semibold text-gray-700 mb-5">2. Generate Payroll</h2>
        <button onClick={handleGenerate} className="inline-flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-10 rounded-full text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg">
          <ChevronsRight className="mr-2 h-6 w-6" />
          Calculate All Payrolls
        </button>
      </section>
      
      <section>
        <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4">
            <h2 className="text-xl font-semibold text-gray-700">3. Review & Approve Results</h2>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Search by Name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div className="flex items-center p-1 bg-gray-200 rounded-full">
                    <FilterButton value="" label="All" />
                    <FilterButton value="pending" label="Pending" />
                    <FilterButton value="approved" label="Approved" />
                    <FilterButton value="rejected" label="Rejected" />
                </div>
            </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Emp ID', 'Name', 'Base Salary', 'Incentives', 'Deductions', 'Final Salary', 'Status', 'Action'].map(head =>
                    <th key={head} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{head}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr><td colSpan="8" className="text-center py-12 text-gray-500">Loading...</td></tr>
                ) : results.length === 0 ? (
                    <tr><td colSpan="8" className="text-center py-12 text-gray-500">No results to display.</td></tr>
                ) : results.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{r.employee.employee_id}</td>
                    <td className="px-6 py-4">{r.employee.name}</td>
                    <td className="px-6 py-4">{formatCurrency(r.employee.base_salary)}</td>
                    <td className="px-6 py-4 text-green-600 font-medium cursor-pointer hover:underline" onClick={() => showDetails('Incentives', r.components_snapshot.incentives)}>{formatCurrency(r.total_incentives)}</td>
                    <td className="px-6 py-4 text-red-600 font-medium cursor-pointer hover:underline" onClick={() => showDetails('Deductions', r.components_snapshot.deductions)}>{formatCurrency(r.total_deductions)}</td>
                    <td className="px-6 py-4 font-bold">{formatCurrency(r.final_salary)}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 text-xs font-semibold rounded-full ${ r.status === 'approved' ? 'bg-green-100 text-green-800' : r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800' }`}>{r.status}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {r.status === 'pending' ? (
                        <div className="flex items-center space-x-2">
                          <button onClick={() => handleAction('approve', r.id)} className="p-2 text-green-500 hover:bg-green-100 rounded-full"><CheckCircle size={18} /></button>
                          <button onClick={() => handleAction('reject', r.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><XCircle size={18} /></button>
                          <input type="text" placeholder="Reason..." value={rejectionReasons[r.id] || ''} onChange={(e) => setRejectionReasons({...rejectionReasons, [r.id]: e.target.value})} className="border rounded-md px-2 py-1 text-sm w-36 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                      ) : (<p className="text-xs text-gray-500 italic">{r.status === 'rejected' ? `Reason: ${r.rejection_reason}` : 'Locked'}</p>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-6 text-right">
            {/* MODIFIED: This button now opens the naming modal */}
            <button onClick={() => setArchiveModalOpen(true)} disabled={results.length === 0} className="inline-flex items-center justify-center bg-gray-700 text-white font-bold py-2 px-5 rounded-lg text-sm hover:bg-gray-800 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                <Save className="mr-2 h-4 w-4" />
                Save to History
            </button>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;

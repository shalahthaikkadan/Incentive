// src/components/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
// The import paths have been corrected to be more standard for the bundler.
import api from '../api';
import IconCard from './IconCard';
import DetailsModal from './DetailsModal';
import { Users, TrendingUp, TrendingDown, ChevronsRight, CheckCircle, XCircle, UserCircle } from 'lucide-react';

function AdminDashboard() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, title: '', components: [] });
  const [rejectionReasons, setRejectionReasons] = useState({});

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/payroll/results/');
      setResults(res.data);
    } catch (err) {
      console.error("Failed to fetch results:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const handleGenerate = async () => {
    try {
      await api.post('/payroll/generate/');
      alert('Payroll generated successfully!');
      fetchResults();
    } catch (err) {
      alert('Payroll generation failed.');
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
    setModal({ isOpen: true, title: type, components: components });
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">
      <DetailsModal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false, title: '', components: [] })} title={modal.title} components={modal.components} />
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
        <h2 className="text-xl font-semibold text-gray-700 mb-5">3. Review & Approve Results</h2>
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
                ) : results.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{r.employee.employee_id}</td>
                    <td className="px-6 py-4">{r.employee.name}</td>
                    <td className="px-6 py-4">{formatCurrency(r.employee.base_salary)}</td>
                    <td className="px-6 py-4 text-green-600 font-medium cursor-pointer hover:underline" onClick={() => showDetails('Incentives', r.components_snapshot.incentives)}>
                      {formatCurrency(r.total_incentives)}
                    </td>
                    <td className="px-6 py-4 text-red-600 font-medium cursor-pointer hover:underline" onClick={() => showDetails('Deductions', r.components_snapshot.deductions)}>
                      {formatCurrency(r.total_deductions)}
                    </td>
                    <td className="px-6 py-4 font-bold">{formatCurrency(r.final_salary)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        r.status === 'approved' ? 'bg-green-100 text-green-800' :
                        r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{r.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {r.status === 'pending' ? (
                        <div className="flex items-center space-x-2">
                          <button onClick={() => handleAction('approve', r.id)} className="p-2 text-green-500 hover:bg-green-100 rounded-full"><CheckCircle size={18} /></button>
                          <button onClick={() => handleAction('reject', r.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><XCircle size={18} /></button>
                          <input 
                            type="text" 
                            placeholder="Reason..." 
                            value={rejectionReasons[r.id] || ''} 
                            onChange={(e) => setRejectionReasons({...rejectionReasons, [r.id]: e.target.value})} 
                            className="border rounded-md px-2 py-1 text-sm w-36 focus:ring-blue-500 focus:border-blue-500" 
                          />
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">{r.status === 'rejected' ? `Reason: ${r.rejection_reason}` : 'Locked'}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;

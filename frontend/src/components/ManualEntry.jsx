// src/components/ManualEntry.jsx
import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { Gift, UserCircle, PlusCircle, Search } from 'lucide-react';

function ManualEntry() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState(''); // Changed from 'reason'
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  // NEW: State for the employee search term
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/employees/');
        setEmployees(res.data);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  // NEW: Memoized filtering of employees based on the search term
  const filteredEmployees = useMemo(() => {
    if (!employeeSearchTerm) {
      return employees;
    }
    return employees.filter(emp =>
      emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(employeeSearchTerm.toLowerCase())
    );
  }, [employees, employeeSearchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !amount || !remark) { // Changed from 'reason'
      setMessage({ type: 'error', text: 'Please fill out all required fields.' });
      return;
    }
    setIsSubmitting(true);
    setMessage('');

    const formData = new FormData();
    formData.append('employee', selectedEmployee);
    formData.append('amount', amount);
    formData.append('reason', remark); // Changed from 'reason'
    if (attachment) {
      formData.append('attachment', attachment);
    }

    try {
      await api.post('/components/manual-add/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage({ type: 'success', text: 'Incentive added successfully!' });
      // Reset form
      setSelectedEmployee('');
      setAmount('');
      setRemark(''); // Changed from 'reason'
      setAttachment(null);
      setEmployeeSearchTerm('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add incentive. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manual Incentive Entry</h1>
          <p className="text-gray-500 mt-1">Add a single incentive like a gift or spot bonus to an employee.</p>
        </div>
        <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-gray-700">Admin User</span>
            <UserCircle size={36} className="text-gray-400" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="employee-search" className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            {/* NEW: Search input for employees */}
            <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    id="employee-search"
                    placeholder="Search by Name or ID..."
                    value={employeeSearchTerm}
                    onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <select
              id="employee"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled>Select an employee</option>
              {filteredEmployees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 500.00"
              step="0.01"
              required
            />
          </div>

          <div>
            {/* MODIFIED: Label changed to "Remark" */}
            <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
            <input
              type="text"
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Holiday Gift, Spot Bonus"
              required
            />
          </div>

          <div>
            <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">Proof Attachment (Optional)</label>
            <input
              type="file"
              id="attachment"
              onChange={(e) => setAttachment(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-6 rounded-full text-base hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg disabled:bg-gray-400"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              {isSubmitting ? 'Adding...' : 'Add Incentive'}
            </button>
            {message && (
              <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
              </p>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

export default ManualEntry;

// src/App.js
import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import WelcomePage from './components/WelcomePage.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');

  if (currentPage === 'welcome') {
    return <WelcomePage onGetStarted={() => setCurrentPage('dashboard')} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar />
      <AdminDashboard />
    </div>
  );
}

export default App;

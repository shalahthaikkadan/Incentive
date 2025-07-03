// src/App.js
import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import WelcomePage from './components/WelcomePage.jsx';
import ManualEntry from './components/ManualEntry.jsx';
import History from './components/History.jsx'; // NEW

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'manualEntry':
        return <ManualEntry />;
      // NEW: Add the case for the history page
      case 'history':
        return <History />;
      case 'settings':
        return <main className="flex-1 p-8"><h1 className="text-3xl font-bold">Settings</h1></main>;
      default:
        return <AdminDashboard />;
    }
  };

  if (currentPage === 'welcome') {
    return <WelcomePage onGetStarted={() => setCurrentPage('dashboard')} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default App;

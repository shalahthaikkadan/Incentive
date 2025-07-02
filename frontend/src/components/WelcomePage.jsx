// src/components/WelcomePage.jsx
import React from 'react';
import { Rocket } from 'lucide-react';

function WelcomePage({ onGetStarted }) {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800">
          Payroll Processing, Simplified.
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your Excel or CSV files, calculate salaries, and manage approvals all in one place.
        </p>
        <button
          onClick={onGetStarted}
          className="mt-10 inline-flex items-center justify-center bg-blue-600 text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-xl"
        >
          <Rocket className="mr-3 h-6 w-6" />
          Get Started
        </button>
      </div>
    </div>
  );
}

export default WelcomePage;

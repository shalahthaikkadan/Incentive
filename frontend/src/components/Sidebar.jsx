// src/components/Sidebar.jsx
import React from 'react';
import { LayoutDashboard, FileUp, Settings } from 'lucide-react';

function Sidebar() {
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Uploads', icon: <FileUp size={20} /> },
    { name: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">Payroll<span className="font-light">App</span></h1>
      </div>
      <nav className="flex-grow px-4 py-6">
        <ul>
          {navItems.map((item, index) => (
            <li key={item.name}>
              <a
                href="#"
                className={`flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                  index === 0
                    ? 'bg-blue-50 text-blue-600 font-semibold' // Active state
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">&copy; 2025 PayrollApp Inc.</p>
      </div>
    </aside>
  );
}

export default Sidebar;

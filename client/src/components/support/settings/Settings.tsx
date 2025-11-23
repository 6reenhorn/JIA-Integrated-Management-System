import React, { useState, useEffect } from 'react';
import DashboardCard from '../../layout/LayoutCard';
import DateFormatSettings from './DateFormatSettings';
import SidebarSettings from './SidebarSettings';

const Settings: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebarDefaultExpanded');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarDefaultExpanded', sidebarExpanded.toString());
  }, [sidebarExpanded]);

  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DateFormatSettings />
          <SidebarSettings 
            sidebarExpanded={sidebarExpanded}
            onToggle={setSidebarExpanded}
          />
        </div>
      </div>

      {/* Other Settings */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Account & System</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Account Settings">
            <p className="text-gray-600 text-sm">Manage your account information and security</p>
            <button className="mt-4 px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              Coming Soon
            </button>
          </DashboardCard>
          
          <DashboardCard title="Notifications">
            <p className="text-gray-600 text-sm">Configure notification preferences</p>
            <button className="mt-4 px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              Coming Soon
            </button>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default Settings;
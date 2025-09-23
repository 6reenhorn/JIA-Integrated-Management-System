import React from 'react';
import DashboardCard from '../../layout/LayoutCard';

const Settings: React.FC = () => (
  <div className="space-y-6">
    <DashboardCard title="Settings">
      <p className="text-gray-600">
        Configure application settings and preferences.
      </p>
      <div className="mt-4 space-y-2">
        <div className="text-sm text-gray-500">Available Settings:</div>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>User preferences</li>
          <li>Notification settings</li>
          <li>Security options</li>
          <li>Theme customization</li>
        </ul>
      </div>
    </DashboardCard>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DashboardCard title="Account Settings">
        <p className="text-gray-600">Manage your account information and security</p>
      </DashboardCard>
      <DashboardCard title="App Preferences">
        <p className="text-gray-600">Customize your application experience</p>
      </DashboardCard>
    </div>
    
    <DashboardCard title="System Configuration">
      <p className="text-gray-600">Advanced system settings and configurations</p>
    </DashboardCard>
  </div>
);

export default Settings;
import React from 'react';
import DashboardCard from '../../layout/LayoutCard';

const VersionInfo: React.FC = () => (
  <DashboardCard title="Version Info">
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-gray-500">Current Version</h4>
        <p className="text-gray-800">v1.0.0</p>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500">Build Details</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li><strong>Project Start:</strong> August 18, 2025</li>
          <li><strong>Projected End:</strong> December 17, 2025</li>
          <li><strong>Development Phase:</strong> August - December 2025</li>
          <li><strong>Technology Stack:</strong> React, TypeScript, Node.js</li>
        </ul>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500">Release Notes</h4>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>Initial release of JIMS application</li>
          <li>Core modules: Inventory, POS, Attendance, E-Wallet Tracking</li>
          <li>Basic reporting and analytics features</li>
        </ul>
      </div>
    </div>
  </DashboardCard>
);

export default VersionInfo;
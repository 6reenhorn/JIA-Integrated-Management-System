import React from 'react';
import DashboardCard from '../../layout/LayoutCard';
import VersionInfo from './VersionInfo';
import Support from './Support';
import LicenseAndCredits from './LicenseAndCredits';

const About: React.FC = () => (
  <div className="space-y-6">
    <DashboardCard title="About JIMS">
      <p className="text-gray-600 mb-4">
        JIA Integrated Management System (JIMS) is a comprehensive software solution designed to 
        digitalize and streamline business operations for JIA Business Center.
      </p>
      <div className="mt-4 space-y-2">
        <div className="text-sm text-gray-500 font-medium">Application Info:</div>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li><strong>Version:</strong> 1.0.0</li>
          <li><strong>Release Date:</strong> December 2025</li>
          <li><strong>Support:</strong>Nobus Group</li>
          <li><strong>Documentation:</strong> Project Charter & Technical Specifications</li>
        </ul>
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Key Features:</h4>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>Inventory Management</li>
          <li>Point-of-Sale (POS) System</li>
          <li>Employee Attendance Monitoring</li>
          <li>E-Wallet Transaction Tracking</li>
          <li>Business Reporting & Analytics</li>
        </ul>
      </div>
    </DashboardCard>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <VersionInfo />
      <Support />
    </div>
    
    <LicenseAndCredits />
  </div>
);

export default About;
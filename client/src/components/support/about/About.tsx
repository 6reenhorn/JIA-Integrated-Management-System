import React from 'react';
import DashboardCard from '../../layout/LayoutCard';

const About: React.FC = () => (
  <div className="space-y-6">
    <DashboardCard title="About">
      <p className="text-gray-600">
        Learn more about the application and its features.
      </p>
      <div className="mt-4 space-y-2">
        <div className="text-sm text-gray-500">Application Info:</div>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>Version information</li>
          <li>Release notes</li>
          <li>Contact support</li>
          <li>Documentation</li>
        </ul>
      </div>
    </DashboardCard>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DashboardCard title="Version Info">
        <p className="text-gray-600">Current application version and build details</p>
      </DashboardCard>
      <DashboardCard title="Support">
        <p className="text-gray-600">Get help and contact information</p>
      </DashboardCard>
    </div>
    
    <DashboardCard title="License & Credits">
      <p className="text-gray-600">Software licenses and third-party acknowledgments</p>
    </DashboardCard>
  </div>
);

export default About;
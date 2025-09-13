import React from 'react';
import DashboardCard from '../view/DashboardCard';

const Employees: React.FC = () => (
  <div className="space-y-6">
    <DashboardCard title="Employee Management">
      <p className="text-gray-600">
        View and manage employee information, roles, and permissions.
      </p>
      <div className="mt-4 space-y-2">
        <div className="text-sm text-gray-500">Management Features:</div>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>Employee profiles</li>
          <li>Role assignments</li>
          <li>Permission management</li>
          <li>Performance tracking</li>
        </ul>
      </div>
    </DashboardCard>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DashboardCard title="Total Employees">
        <p className="text-gray-600">Active employee count</p>
      </DashboardCard>
      <DashboardCard title="Departments">
        <p className="text-gray-600">Department breakdown</p>
      </DashboardCard>
      <DashboardCard title="New Hires">
        <p className="text-gray-600">Recent additions</p>
      </DashboardCard>
    </div>
  </div>
);

export default Employees;
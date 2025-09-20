import React from 'react';
import DashboardCard from '../view/DashboardCard';

const Overview: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <DashboardCard />
      <DashboardCard />
      <DashboardCard />
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardCard className="min-h-[200px]" />
      <DashboardCard className="min-h-[200px]" />
    </div>
    
    <div className="grid grid-cols-1 gap-6">
      <DashboardCard className="min-h-[180px]" />
    </div>
  </div>
);

export default Overview;
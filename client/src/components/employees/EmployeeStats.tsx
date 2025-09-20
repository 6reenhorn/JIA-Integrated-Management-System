import React from 'react';
import { User, Plus } from 'lucide-react';
import DashboardCard from '../view/DashboardCard';
import type { EmployeeStats as EmployeeStatsType } from './types';

interface EmployeeStatsProps {
  stats: EmployeeStatsType;
}

const EmployeeStats: React.FC<EmployeeStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DashboardCard title="Total Employees">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
            <p className="text-sm text-gray-600">{stats.activeEmployees} active employees</p>
          </div>
          <User className="w-8 h-8 text-blue-500" />
        </div>
      </DashboardCard>
      
      <DashboardCard title="Departments">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.departments}</p>
            <p className="text-sm text-gray-600">Active departments</p>
          </div>
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 font-semibold">{stats.departments}</span>
          </div>
        </div>
      </DashboardCard>
      
      <DashboardCard title="New Hires">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.newHires}</p>
            <p className="text-sm text-gray-600">This week</p>
          </div>
          <Plus className="w-8 h-8 text-purple-500" />
        </div>
      </DashboardCard>
    </div>
  );
};

export default EmployeeStats;
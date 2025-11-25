import React from 'react';
import { User, Plus } from 'lucide-react';
import LayoutCard from '../../layout/LayoutCard';
import Skeleton from '../../common/Skeleton';
import type { EmployeeStats as EmployeeStatsType } from '../../../types/employee_types';

interface EmployeeStatsProps {
  stats: EmployeeStatsType;
  loading?: boolean;
}

const EmployeeStats: React.FC<EmployeeStatsProps> = ({ stats, loading = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <LayoutCard title="Total Employees">
        {loading ? (
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="w-8 h-8 rounded" />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              <p className="text-sm text-gray-600">{stats.activeEmployees} active staff</p>
            </div>
            <User className="w-8 h-8 text-blue-500" />
          </div>
        )}
      </LayoutCard>

      <LayoutCard title="Active Staff">
        {loading ? (
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeEmployees}</p>
              <p className="text-sm text-gray-600">Currently working</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold">{stats.activeEmployees}</span>
            </div>
          </div>
        )}
      </LayoutCard>

      <LayoutCard title="Recent Logins">
        {loading ? (
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="w-8 h-8 rounded" />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.newHires}</p>
              <p className="text-sm text-gray-600">Last 24 hours</p>
            </div>
            <Plus className="w-8 h-8 text-purple-500" />
          </div>
        )}
      </LayoutCard>
    </div>
  );
};

export default EmployeeStats;
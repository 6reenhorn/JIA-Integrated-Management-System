import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import LayoutCard from '../../layout/LayoutCard';
import type { AttendanceStats as AttendanceStatsType } from '../../../types/employee_types';

interface AttendanceStatsProps {
  stats: AttendanceStatsType;
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <LayoutCard title="Present">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
            <p className="text-sm text-gray-600">Currently present</p>
          </div>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </LayoutCard>

      <LayoutCard title="Absent">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
            <p className="text-sm text-gray-600">Not present today</p>
          </div>
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </LayoutCard>

      <LayoutCard title="On Leave">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.onLeave}</p>
            <p className="text-sm text-gray-600">Currently on leave</p>
          </div>
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </LayoutCard>
    </div>
  );
};

export default AttendanceStats;

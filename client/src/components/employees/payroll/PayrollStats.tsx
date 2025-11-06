import React from 'react';
import LayoutCard from '../../layout/LayoutCard';

interface PayrollStatsProps {
  totalPayroll?: number;
  paidPayroll?: number;
  pendingPayroll?: number;
  overduePayroll?: number;
}

const PayrollStats: React.FC<PayrollStatsProps> = ({
  totalPayroll = 0,
  paidPayroll = 0,
  pendingPayroll = 0,
  overduePayroll = 0,
}) => {
  const stats = [
    {
      title: 'Total Payroll',
      value: `₱${totalPayroll.toLocaleString()}`,
      subtext: 'Total net payroll',
      color: 'text-black',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Paid',
      value: `₱${paidPayroll.toLocaleString()}`,
      subtext: 'Paid this period',
      color: 'text-black',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending',
      value: `₱${pendingPayroll.toLocaleString()}`,
      subtext: 'Pending payment',
      color: 'text-black',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Overdue',
      value: `₱${overduePayroll.toLocaleString()}`,
      subtext: 'Past due',
      color: 'text-black',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => (
        <LayoutCard key={index} title={stat.title}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.subtext}</p>
            </div>
            <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
              <svg className={`w-6 h-6 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </LayoutCard>
      ))}
    </div>
  );
};

export default PayrollStats;

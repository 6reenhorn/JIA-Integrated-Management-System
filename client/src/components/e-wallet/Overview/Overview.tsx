import React from 'react';
import LayoutCard from '../../layout/LayoutCard';
import type { 
  SummaryCardProps, 
  RecordCardProps
} from '../../../types/ewallet_types';

const Overview: React.FC = () => {
  const SummaryCard: React.FC<SummaryCardProps> = ({ title, data }) => (
    <LayoutCard title={title} className="min-h-[200px]">
      <div className="space-y-3">
        {data.map((item, index) => {
          const isHighlight =
            item.label === 'Net Amount' || item.label === 'Total Sales';
          return (
            <div
              key={index}
              className={`flex justify-between items-center ${
                isHighlight ? 'pt-2 mt-2 border-t border-gray-200' : ''
              }`}
            >
              <span
                className={`text-sm ${
                  isHighlight ? 'text-gray-900 font-bold' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
              <span
                className={`${
                  item.value.startsWith('-')
                    ? 'text-red-500 font-medium'
                    : 'text-gray-900 font-medium'
                }`}
              >
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </LayoutCard>
  );

  const RecordCard: React.FC<RecordCardProps> = ({ title, count }) => (
    <LayoutCard className="text-center min-h-[120px]">
      <h3 className="text-gray-500 font-medium mb-2">{title}</h3>
      <div className="text-4xl font-bold text-gray-900">
        {count}
      </div>
    </LayoutCard>
  );

  const gcashData = [
    { label: 'Total Cash-In', value: '₱7,500.00' },
    { label: 'Total Cash-Out', value: '-₱500.00' },
    { label: 'Service Charge', value: '₱10.00' },
    { label: 'Net Amount', value: '₱7,010.00' }
  ];

  const paymayaData = [
    { label: 'Total Cash-In', value: '₱7,500.00' },
    { label: 'Total Cash-Out', value: '-₱500.00' },
    { label: 'Service Charge', value: '₱10.00' },
    { label: 'Net Amount', value: '₱7,010.00' }
  ];

  const juanpayData = [
    { label: 'Total Beginning', value: '₱15,500.00' },
    { label: 'Total Ending', value: '-₱8,400.00' },
    { label: 'Service Charge', value: '₱10.00' },
    { label: 'Total Sales', value: '₱7,100.00' },
    { label: 'Average per Record', value: '₱2,366.67' }
  ];

  return (
    <div className="space-y-6 mt-6">
      {/* Main Stats using LayoutCard directly */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LayoutCard className="bg-blue-500 border-gray-500 min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Total Balance</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">₱14,480.00</div>
          <div className="text-sm text-gray-500">Combined Funds</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">GCash Net</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">₱7,380.00</div>
          <div className="text-sm text-gray-500">After Charges</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">JuanPay</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">₱7,380.00</div>
          <div className="text-sm text-gray-500">Total Revenue</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Today's Record</h3>
          <div className="text-3xl font-bold text-red-500 mb-1">0</div>
          <div className="text-sm text-gray-500">Active Today</div>
        </LayoutCard>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SummaryCard title="GCash Summary" data={gcashData} />
        <SummaryCard title="PayMaya Summary" data={paymayaData} />
        <SummaryCard title="JuanPay Summary" data={juanpayData} />
      </div>

      {/* Records Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <RecordCard title="Total Records" count="9" />
        <RecordCard title="GCash Records" count="3" />
        <RecordCard title="JuanPay Records" count="3" />
        <RecordCard title="PayMaya Records" count="3" />
      </div>
    </div>
  );
};

export default Overview;

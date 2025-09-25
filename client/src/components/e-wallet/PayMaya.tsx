import React from 'react';
import LayoutCard from '../layout/LayoutCard';
import type { 
  SummaryCardProps, 
  RecordCardProps,
  TransactionItem
} from '../../types/ewallet_types';

const PayMaya: React.FC = () => {
  const SummaryCard: React.FC<SummaryCardProps> = ({ title, data }) => (
    <LayoutCard title={title} className="min-h-[200px]">
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">{item.label}</span>
            <span className={`font-medium ${item.value.startsWith('-') ? 'text-red-500' : 'text-gray-900'}`}>
              {item.value}
            </span>
          </div>
        ))}
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

  const paymayaData = [
    { label: 'Total Cash-In', value: '₱7,500.00' },
    { label: 'Total Cash-Out', value: '-₱500.00' },
    { label: 'Service Charge', value: '₱10.00' },
    { label: 'Net Amount', value: '₱7,010.00' }
  ];

  const recentTransactions: TransactionItem[] = [
    { type: 'Load Wallet', date: 'Sept 24, 2025', amount: '+₱3,000.00', isPositive: true },
    { type: 'Online Purchase', date: 'Sept 23, 2025', amount: '-₱250.00', isPositive: false },
    { type: 'Load Wallet', date: 'Sept 22, 2025', amount: '+₱4,500.00', isPositive: true }
  ];

  return (
    <div className="space-y-6">
      {/* PayMaya Stats using LayoutCard directly */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LayoutCard className="bg-green-500 min-h-[120px]">
          <h3 className="text-green-100 font-medium mb-2">PayMaya Balance</h3>
          <div className="text-3xl font-bold text-white mb-1">₱7,010.00</div>
          <div className="text-sm text-green-100">Available Funds</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Total Cash-In</h3>
          <div className="text-3xl font-bold text-green-600 mb-1">₱7,500.00</div>
          <div className="text-sm text-gray-500">This Month</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Total Cash-Out</h3>
          <div className="text-3xl font-bold text-red-500 mb-1">₱500.00</div>
          <div className="text-sm text-gray-500">This Month</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Service Charges</h3>
          <div className="text-3xl font-bold text-orange-500 mb-1">₱10.00</div>
          <div className="text-sm text-gray-500">Monthly Fee</div>
        </LayoutCard>
      </div>

      {/* PayMaya Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SummaryCard title="PayMaya Summary" data={paymayaData} />
        <LayoutCard title="Recent Transactions" className="min-h-[200px]">
          <div className="space-y-3">
            {recentTransactions.map((transaction, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <div className="text-sm font-medium text-gray-900">{transaction.type}</div>
                  <div className="text-xs text-gray-500">{transaction.date}</div>
                </div>
                <span className={`font-medium ${transaction.isPositive ? 'text-green-600' : 'text-red-500'}`}>
                  {transaction.amount}
                </span>
              </div>
            ))}
          </div>
        </LayoutCard>
      </div>

      {/* PayMaya Records */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <RecordCard title="Total Records" count="3" />
        <RecordCard title="Load Wallet" count="2" />
        <RecordCard title="Purchases" count="1" />
        <RecordCard title="Pending" count="0" />
      </div>
    </div>
  );
};

export default PayMaya;

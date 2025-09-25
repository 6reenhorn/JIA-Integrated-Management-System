import React from 'react';
import type { 
  StatCardProps, 
  SummaryCardProps, 
  RecordCardProps,
  TransactionItem
} from '../../types/ewallet_types';

const PayMaya: React.FC = () => {
  const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    amount, 
    subtitle, 
    bgColor = 'bg-white', 
    textColor = 'text-blue-600', 
    subtitleColor = 'text-gray-500' 
  }) => (
    <div className={`${bgColor} rounded-lg p-6 border border-gray-300`}>
      <h3 className="text-gray-500 font-medium mb-2">{title}</h3>
      <div className={`text-3xl font-bold ${textColor} mb-1`}>
        {amount}
      </div>
      <div className={`text-sm ${subtitleColor}`}>
        {subtitle}
      </div>
    </div>
  );

  const SummaryCard: React.FC<SummaryCardProps> = ({ title, data }) => (
    <div className="bg-white rounded-lg p-6 border border-gray-300">
      <h3 className="text-gray-500 font-medium mb-4">{title}</h3>
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
    </div>
  );

  const RecordCard: React.FC<RecordCardProps> = ({ title, count }) => (
    <div className="bg-white rounded-lg p-6 border border-gray-300 text-center">
      <h3 className="text-gray-500 font-medium mb-2">{title}</h3>
      <div className="text-4xl font-bold text-gray-900">
        {count}
      </div>
    </div>
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
      {/* PayMaya Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="PayMaya Balance"
          amount="₱7,010.00"
          subtitle="Available Funds"
          bgColor="bg-green-500"
          textColor="text-white"
          subtitleColor="text-green-100"
        />
        <StatCard
          title="Total Cash-In"
          amount="₱7,500.00"
          subtitle="This Month"
          textColor="text-green-600"
        />
        <StatCard
          title="Total Cash-Out"
          amount="₱500.00"
          subtitle="This Month"
          textColor="text-red-500"
        />
        <StatCard
          title="Service Charges"
          amount="₱10.00"
          subtitle="Monthly Fee"
          textColor="text-orange-500"
        />
      </div>

      {/* PayMaya Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SummaryCard title="PayMaya Summary" data={paymayaData} />
        <div className="bg-white rounded-lg p-6 border border-gray-300">
          <h3 className="text-gray-500 font-medium mb-4">Recent Transactions</h3>
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
        </div>
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
import React from 'react';
import type { 
  StatCardProps, 
  SummaryCardProps, 
  RecordCardProps,
  TransactionItem
} from '../../types/ewallet_types';

const JuanPay: React.FC = () => {
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

  const juanpayData = [
    { label: 'Total Beginning', value: '₱15,500.00' },
    { label: 'Total Ending', value: '-₱8,400.00' },
    { label: 'Service Charge', value: '₱10.00' },
    { label: 'Total Sales', value: '₱7,100.00' },
    { label: 'Average per Record', value: '₱2,366.67' }
  ];

  const recentTransactions: TransactionItem[] = [
    { type: 'Bill Payment', date: 'Sept 24, 2025', amount: '+₱1,500.00', isPositive: true },
    { type: 'Transfer', date: 'Sept 23, 2025', amount: '-₱3,200.00', isPositive: false },
    { type: 'Remittance', date: 'Sept 22, 2025', amount: '+₱8,800.00', isPositive: true }
  ];

  return (
    <div className="space-y-6">
      {/* JuanPay Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="JuanPay Balance"
          amount="₱7,100.00"
          subtitle="Total Sales"
          bgColor="bg-purple-500"
          textColor="text-white"
          subtitleColor="text-purple-100"
        />
        <StatCard
          title="Beginning Balance"
          amount="₱15,500.00"
          subtitle="Start of Month"
          textColor="text-blue-600"
        />
        <StatCard
          title="Ending Balance"
          amount="₱8,400.00"
          subtitle="Current Month"
          textColor="text-red-500"
        />
        <StatCard
          title="Average per Record"
          amount="₱2,366.67"
          subtitle="Per Transaction"
          textColor="text-green-600"
        />
      </div>

      {/* JuanPay Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SummaryCard title="JuanPay Summary" data={juanpayData} />
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

      {/* JuanPay Records */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <RecordCard title="Total Records" count="3" />
        <RecordCard title="Bill Payments" count="1" />
        <RecordCard title="Remittances" count="1" />
        <RecordCard title="Transfers" count="1" />
      </div>
    </div>
  );
};

export default JuanPay;
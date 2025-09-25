import React from 'react';
import LayoutCard from '../layout/LayoutCard';
import type { 
  SummaryCardProps, 
  RecordCardProps,
  TransactionItem
} from '../../types/ewallet_types';

const JuanPay: React.FC = () => {
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
      {/* JuanPay Stats using LayoutCard directly */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LayoutCard className="bg-purple-500 min-h-[120px]">
          <h3 className="text-purple-100 font-medium mb-2">JuanPay Balance</h3>
          <div className="text-3xl font-bold text-white mb-1">₱7,100.00</div>
          <div className="text-sm text-purple-100">Total Sales</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Beginning Balance</h3>
          <div className="text-3xl font-bold text-blue-600 mb-1">₱15,500.00</div>
          <div className="text-sm text-gray-500">Start of Month</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Ending Balance</h3>
          <div className="text-3xl font-bold text-red-500 mb-1">₱8,400.00</div>
          <div className="text-sm text-gray-500">Current Month</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Average per Record</h3>
          <div className="text-3xl font-bold text-green-600 mb-1">₱2,366.67</div>
          <div className="text-sm text-gray-500">Per Transaction</div>
        </LayoutCard>
      </div>

      {/* JuanPay Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SummaryCard title="JuanPay Summary" data={juanpayData} />
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

import React from 'react';
import LayoutCard from '../../layout/LayoutCard';

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

interface StatsData {
  cashIn: number;
  cashInCharges: number;
  cashOut: number;
  cashOutCharges: number;
}

interface GCashStatsCardsProps {
  isLoading: boolean;
  stats: StatsData;
  filterDate: Date | null;
}

const GCashStatsCards: React.FC<GCashStatsCardsProps> = ({ isLoading, stats, filterDate }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <LayoutCard key={i} className="min-h-[120px] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-5"></div>
            <div className={`h-9 rounded w-40 mb-2 ${i === 2 || i === 4 ? 'bg-red-200' : 'bg-gray-200'}`}></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </LayoutCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <LayoutCard className="bg-blue-500 min-h-[120px]">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-500 font-medium">Cash-In {filterDate ? '(Filtered)' : '(Today)'}</h3>
          {filterDate && (
            <div className="text-right text-xs text-gray-600">
              {filterDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">₱{formatCurrency(stats.cashIn)}</div>
        <div className="text-sm text-gray-500">Total Cash-In Amount</div>
      </LayoutCard>

      <LayoutCard className="bg-blue-500 min-h-[120px]">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-500 font-medium">Cash-In {filterDate ? '(Filtered)' : '(Today)'}</h3>
          {filterDate && (
            <div className="text-right text-xs text-gray-600">
              {filterDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-red-500 mb-1">₱{formatCurrency(stats.cashInCharges)}</div>
        <div className="text-sm text-gray-500">Service Fees (Cash-In)</div>
      </LayoutCard>

      <LayoutCard className="bg-blue-500 min-h-[120px]">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-500 font-medium">Cash-Out {filterDate ? '(Filtered)' : '(Today)'}</h3>
          {filterDate && (
            <div className="text-right text-xs text-gray-600">
              {filterDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">₱{formatCurrency(stats.cashOut)}</div>
        <div className="text-sm text-gray-500">Total Cash-Out Amount</div>
      </LayoutCard>

      <LayoutCard className="bg-blue-500 min-h-[120px]">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-500 font-medium">Cash-Out {filterDate ? '(Filtered)' : '(Today)'}</h3>
          {filterDate && (
            <div className="text-right text-xs text-gray-600">
              {filterDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-red-500 mb-1">₱{formatCurrency(stats.cashOutCharges)}</div>
        <div className="text-sm text-gray-500">Service Fees (Cash-Out)</div>
      </LayoutCard>
    </div>
  );
};

export default GCashStatsCards;
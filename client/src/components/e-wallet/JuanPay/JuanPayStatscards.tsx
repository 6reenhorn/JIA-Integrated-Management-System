import React from 'react';
import LayoutCard from '../../layout/LayoutCard';

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

interface StatsData {
  totalBeginning: number;
  totalEnding: number;
  totalSales: number;
  avgSales: number;
}

interface JuanPayStatsCardsProps {
  isLoading: boolean;
  stats: StatsData;
  filterDate: Date | null;
}

const JuanPayStatsCards: React.FC<JuanPayStatsCardsProps> = ({ isLoading, stats, filterDate }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <LayoutCard key={i} className="min-h-[120px] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-5"></div>
            <div className={`h-9 rounded w-40 mb-2 ${i === 3 ? 'bg-red-200' : 'bg-gray-200'}`}></div>
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
          <h3 className="text-gray-500 font-medium">Beginning Balance {filterDate ? '(Filtered)' : '(Today)'}</h3>
          {filterDate && (
            <div className="text-right text-xs text-gray-600">
              {filterDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">₱{formatCurrency(stats.totalBeginning)}</div>
        <div className="text-sm text-gray-500">Total Beginning</div>
      </LayoutCard>

      <LayoutCard className="min-h-[120px]">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-500 font-medium">Ending Balance {filterDate ? '(Filtered)' : '(Today)'}</h3>
          {filterDate && (
            <div className="text-right text-xs text-gray-600">
              {filterDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">₱{formatCurrency(stats.totalEnding)}</div>
        <div className="text-sm text-gray-500">Current Balance</div>
      </LayoutCard>

      <LayoutCard className="min-h-[120px]">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-500 font-medium">Sales {filterDate ? '(Filtered)' : '(Today)'}</h3>
          {filterDate && (
            <div className="text-right text-xs text-gray-600">
              {filterDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-red-500 mb-1">₱{formatCurrency(stats.totalSales)}</div>
        <div className="text-sm text-gray-500">Total Sales</div>
      </LayoutCard>

      <LayoutCard className="min-h-[120px]">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-500 font-medium">Average per Record {filterDate ? '(Filtered)' : '(Today)'}</h3>
          {filterDate && (
            <div className="text-right text-xs text-gray-600">
              {filterDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">₱{formatCurrency(stats.avgSales)}</div>
        <div className="text-sm text-gray-500">Per Transaction</div>
      </LayoutCard>
    </div>
  );
};

export default JuanPayStatsCards;
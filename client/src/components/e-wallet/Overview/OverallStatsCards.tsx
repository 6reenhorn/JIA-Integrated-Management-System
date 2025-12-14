import React from 'react';
import LayoutCard from '../../layout/LayoutCard';
import { useDateFormat } from '../../../context/DateFormatContext';

interface OverallStatsCardsProps {
  overallStats: {
    totalCashIn: number;
    totalCashInCharges: number;
    totalCashOut: number;
    totalCashOutCharges: number;
  };
  startDate: Date | null;
  endDate: Date | null;
  isLoading?: boolean;
}

const OverallStatsCards: React.FC<OverallStatsCardsProps> = ({ 
  overallStats, 
  startDate, 
  endDate,
  isLoading = false 
}) => {
  const { formatDate } = useDateFormat();

  const formatCurrency = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return amount < 0 ? `₱-${formatted}` : `₱${formatted}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <LayoutCard key={i} className="min-h-[120px] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-5"></div>
            <div className="h-9 bg-gray-200 rounded w-40 mb-2"></div>
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
          <h3 className="text-gray-500 font-medium">Total Cash In</h3>
          {(startDate && endDate) && (
            <div className="text-right text-xs text-gray-600">
              {startDate.toDateString() === endDate.toDateString() ? (
                <div>{formatDate(startDate)}</div>
              ) : (
                <div>{formatDate(startDate)} - {formatDate(endDate)}</div>
              )}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {formatCurrency(overallStats.totalCashIn)}
        </div>
        <div className="text-sm text-gray-500">Overall</div>
      </LayoutCard>

      <LayoutCard className="min-h-[120px]">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-500 font-medium">Total Cash In Charges</h3>
          {(startDate && endDate) && (
            <div className="text-right text-xs text-gray-600">
              {startDate.toDateString() === endDate.toDateString() ? (
                <div>{formatDate(startDate)}</div>
              ) : (
                <div>{formatDate(startDate)} - {formatDate(endDate)}</div>
              )}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {formatCurrency(overallStats.totalCashInCharges)}
        </div>
        <div className="text-sm text-gray-500">Service Fees</div>
      </LayoutCard>

      <LayoutCard className="min-h-[120px]">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-500 font-medium">Total Cash Out</h3>
          {(startDate && endDate) && (
            <div className="text-right text-xs text-gray-600">
              {startDate.toDateString() === endDate.toDateString() ? (
                <div>{formatDate(startDate)}</div>
              ) : (
                <div>{formatDate(startDate)} - {formatDate(endDate)}</div>
              )}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {formatCurrency(overallStats.totalCashOut)}
        </div>
        <div className="text-sm text-gray-500">Overall</div>
      </LayoutCard>

      <LayoutCard className="min-h-[120px]">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-500 font-medium">Total Cash Out Charges</h3>
          {(startDate && endDate) && (
            <div className="text-right text-xs text-gray-600">
              {startDate.toDateString() === endDate.toDateString() ? (
                <div>{formatDate(startDate)}</div>
              ) : (
                <div>{formatDate(startDate)} - {formatDate(endDate)}</div>
              )}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {formatCurrency(overallStats.totalCashOutCharges)}
        </div>
        <div className="text-sm text-gray-500">Service Fees</div>
      </LayoutCard>
    </div>
  );
};

export default OverallStatsCards;
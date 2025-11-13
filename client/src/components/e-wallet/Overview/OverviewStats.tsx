import React from 'react';
import LayoutCard from '../../layout/LayoutCard';

interface OverviewStatsProps {
  totalCashIn: number;
  totalCashInCharges: number;
  totalCashOut: number;
  totalCashOutCharges: number;
}

const OverviewStats: React.FC<OverviewStatsProps> = ({
  totalCashIn,
  totalCashInCharges,
  totalCashOut,
  totalCashOutCharges
}) => {
  const formatCurrency = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return amount < 0 ? `₱-${formatted}` : `₱${formatted}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <LayoutCard className="bg-blue-500 min-h-[120px]">
        <h3 className="text-gray-500 font-medium mb-2">Total Cash In</h3>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {formatCurrency(totalCashIn)}
        </div>
        <div className="text-sm text-gray-500">Overall</div>
      </LayoutCard>
      <LayoutCard className="min-h-[120px]">
        <h3 className="text-gray-500 font-medium mb-2">Total Cash In Charges</h3>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {formatCurrency(totalCashInCharges)}
        </div>
        <div className="text-sm text-gray-500">Service Fees</div>
      </LayoutCard>
      <LayoutCard className="min-h-[120px]">
        <h3 className="text-gray-500 font-medium mb-2">Total Cash Out</h3>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {formatCurrency(totalCashOut)}
        </div>
        <div className="text-sm text-gray-500">Overall</div>
      </LayoutCard>
      <LayoutCard className="min-h-[120px]">
        <h3 className="text-gray-500 font-medium mb-2">Total Cash Out Charges</h3>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {formatCurrency(totalCashOutCharges)}
        </div>
        <div className="text-sm text-gray-500">Service Fees</div>
      </LayoutCard>
    </div>
  );
};

export default OverviewStats;
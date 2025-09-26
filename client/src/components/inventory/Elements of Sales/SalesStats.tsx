import React from 'react';

interface SalesStatsProps {
  totalSales: number;
  totalAmount: number;
  averageSale: number;
  totalItemsSold: number;
}

const SalesStats: React.FC<SalesStatsProps> = ({
  totalSales,
  totalAmount,
  averageSale,
  totalItemsSold
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Selected Date Sales */}
      <div className="bg-gray-100 rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Selected Date Sales</h3>
        <p className="text-3xl font-bold text-gray-900">₱{totalAmount.toFixed(2)}</p>
        <p className="text-xs text-gray-500 mt-1">{totalSales} Transactions</p>
      </div>

      {/* Selected Date Quantity */}
      <div className="bg-gray-100 rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Selected Date Quantity</h3>
        <p className="text-3xl font-bold text-gray-900">{totalItemsSold}</p>
        <p className="text-xs text-gray-500 mt-1">Item Sold</p>
      </div>

      {/* Total Sales */}
      <div className="bg-gray-100 rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Total Sales</h3>
        <p className="text-3xl font-bold text-gray-900">₱{totalAmount.toFixed(2)}</p>
        <p className="text-xs text-gray-500 mt-1">All Time</p>
      </div>

      {/* Average Sales */}
      <div className="bg-gray-100 rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Average sales</h3>
        <p className="text-3xl font-bold text-gray-900">₱{averageSale.toFixed(2)}</p>
        <p className="text-xs text-gray-500 mt-1">Per Transaction</p>
      </div>
    </div>
  );
};

export default SalesStats;
import React from 'react';
import { Package, TrendingDown, AlertTriangle, XCircle } from 'lucide-react';
import DashboardCard from '../layout/LayoutCard';
import type { InventoryStats as InventoryStatsType } from '../../types/inventory_types';

interface InventoryStatsProps {
  stats: InventoryStatsType;
}

const InventoryStats: React.FC<InventoryStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <DashboardCard title="Total Items">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalItems}</p>
            <p className="text-sm text-gray-500 mt-1">All inventory items</p>
          </div>
          <Package className="h-8 w-8 text-blue-500" />
        </div>
      </DashboardCard>

      <DashboardCard title="Low Stock Items">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-yellow-600">{stats.lowStockItems}</p>
            <p className="text-sm text-gray-500 mt-1">Need restocking</p>
          </div>
          <TrendingDown className="h-8 w-8 text-yellow-500" />
        </div>
      </DashboardCard>

      <DashboardCard title="Expired Items">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-red-600">{stats.expiredItems}</p>
            <p className="text-sm text-gray-500 mt-1">Past expiry date</p>
          </div>
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
      </DashboardCard>

      <DashboardCard title="Out of Stock Items">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-red-600">{stats.outOfStockItems}</p>
            <p className="text-sm text-gray-500 mt-1">No stock available</p>
          </div>
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
      </DashboardCard>
    </div>
  );
};

export default InventoryStats;
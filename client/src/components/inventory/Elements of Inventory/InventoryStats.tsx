import React from 'react';
import type { InventoryStats as InventoryStatsType } from '../../../types/inventory_types';

interface InventoryStatsProps {
  stats: InventoryStatsType;
}

const InventoryStats: React.FC<InventoryStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Total Products */}
      <div className="bg-gray-100 rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Total Products</h3>
        <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalItems}</p>
        <p className="text-xs text-gray-500">All inventory items</p>
      </div>

      {/* Inventory Value */}
      <div className="bg-gray-100 rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Inventory Value</h3>
        <p className="text-3xl font-bold text-gray-900 mb-1">₱{(stats.inventoryValue || 0).toFixed(2)}</p>
        <p className="text-xs text-gray-500">Across all items</p>
      </div>

      {/* Low Stock Items */}
      <div className="bg-gray-100 rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Low Stock Items</h3>
        <p className="text-3xl font-bold text-red-600 mb-1">{stats.lowStockItems}</p>
        <div className="h-6 flex items-end">
          <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
            Needs Attention
          </span>
        </div>
      </div>

      {/* Out of Stock Items */}
      <div className="bg-gray-100 rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Out of Stock Items</h3>
        <p className="text-3xl font-bold text-red-600 mb-1">{stats.outOfStockItems}</p>
        <div className="h-6 flex items-end">
          <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
            Restock Immediately
          </span>
        </div>
      </div>
    </div>
  );
};

export default InventoryStats;
import React from 'react';
import type { InventoryStats as InventoryStatsType } from '../../../types/inventory_types';

interface InventoryStatsProps {
  stats: InventoryStatsType;
}

const InventoryStats: React.FC<InventoryStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
      {/* Total Items */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-medium font-bold text-black">Total Products</h3>
        </div>
        <div className="text-left">
          <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalItems}</p>
          <p className="text-xs text-gray-500">All inventory items</p>
        </div>
      </div>

      {/* Inventory Value */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-medium font-bold text-black">Inventory Value</h3>
        </div>
        <div className="text-left">
          <p className="text-3xl font-bold text-yellow-600 mb-1">₱{(stats.inventoryValue || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-500">Across all items</p>
        </div>
      </div>

      {/* Low Stock Items */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-medium font-bold text-black">Low Stock Items</h3>
        </div>
        <div className="text-left">
          <p className="text-3xl font-bold text-red-600 mb-1">{stats.lowStockItems}</p>
          <p className="inline-block px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
            Needs Attention
          </p>
        </div>
      </div>

      {/* Out of Stock Items */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-medium font-bold text-black">Out of Stock Items</h3>
        </div>
        <div className="text-left">
          <p className="text-3xl font-bold text-red-600 mb-1">{stats.outOfStockItems}</p>
          <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
            Restock Immediately
          </span>
        </div>
      </div>
    </div>
  );
};

export default InventoryStats;
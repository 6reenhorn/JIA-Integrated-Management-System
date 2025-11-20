import React from 'react';
import MainLayoutCard from '../../layout/MainLayoutCard';
import LayoutCard from '../../layout/LayoutCard';
import InventoryFilters from './InventoryFilters';
import type { InventoryStats as InventoryStatsType } from '../../../types/inventory_types';

interface InventoryStatsProps {
  stats: InventoryStatsType;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  onAddItem: () => void;
  totalItems: number;
  activeSection: string;
  setActiveSection: (section: string) => void;
  onAddCategory: () => void;
  sections: Array<{ id: string; label: string; key: string }>;
  children?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const InventoryStats: React.FC<InventoryStatsProps> = ({ 
  stats,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  filterOpen,
  setFilterOpen,
  onAddItem,
  totalItems,
  activeSection,
  setActiveSection,
  onAddCategory,
  sections,
  children,
  onRefresh,
  isRefreshing
}) => {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Products */}
        <LayoutCard>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalItems}</p>
          <p className="text-xs text-gray-500">All inventory items</p>
        </LayoutCard>

        {/* Inventory Value */}
        <LayoutCard>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Inventory Value</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">₱{(stats.inventoryValue || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-500">Across all items</p>
        </LayoutCard>

        {/* Low Stock Items */}
        <LayoutCard>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Low Stock Items</h3>
          <p className="text-3xl font-bold text-red-600 mb-1">{stats.lowStockItems}</p>
          <div className="h-6 flex items-end">
            <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
              Needs Attention
            </span>
          </div>
        </LayoutCard>

        {/* Out of Stock Items */}
        <LayoutCard>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Out of Stock Items</h3>
          <p className="text-3xl font-bold text-red-600 mb-1">{stats.outOfStockItems}</p>
          <div className="h-6 flex items-end">
            <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
              Restock Immediately
            </span>
          </div>
        </LayoutCard>
      </div>

      {/* MainLayoutCard with filters and content */}
      <MainLayoutCard 
        sections={sections} 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      >
        <div className="space-y-6">
          <InventoryFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            onAddItem={onAddItem}
            totalItems={totalItems}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onAddCategory={onAddCategory}
            showTabsAndTitle={false}
            sections={sections}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />
          {/* Content area for table - will be passed as children from parent */}
          {children}
        </div>
      </MainLayoutCard>
    </>
  );
};

export default InventoryStats;
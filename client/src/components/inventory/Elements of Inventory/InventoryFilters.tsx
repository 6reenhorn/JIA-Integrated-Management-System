import React from 'react';
import { Search, Plus } from 'lucide-react';

interface InventoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  onAddItem: () => void;
  totalItems?: number;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onAddCategory?: () => void; // Add this prop
}

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  onAddItem,
  totalItems = 0,
  activeTab = 'inventory',
  setActiveTab = () => {},
  onAddCategory = () => {} // Add default function
}) => {
  return (
    <div className="mb-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-t ${
              activeTab === 'inventory'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('category')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-t ${
              activeTab === 'category'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Category
          </button>
        </nav>
      </div>

      {/* Header with Search and Actions */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {activeTab === 'inventory' ? `Inventory (${totalItems} items)` : 'Categories'}
        </h2>

        <div className="flex gap-3">
          {/* Search - Show for both tabs with different placeholders */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={activeTab === 'inventory' ? "Search Items" : "Search Categories"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none w-64 transition-all"
            />
          </div>

          {/* Category Filter - Only show for inventory tab */}
          {activeTab === 'inventory' && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white transition-all"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          )}

          {/* Add Button - Different for each tab */}
          {activeTab === 'inventory' ? (
            <button 
              onClick={onAddItem}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          ) : (
            <button 
              onClick={onAddCategory}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;
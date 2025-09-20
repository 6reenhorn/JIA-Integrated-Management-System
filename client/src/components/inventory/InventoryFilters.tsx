import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';

interface InventoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  onAddItem: () => void;
}

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  filterOpen,
  setFilterOpen,
  onAddItem
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <p className="text-gray-600 mb-4 sm:mb-0">
          Manage your inventory items, stock levels, and product information.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Items"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            
            <button 
              onClick={onAddItem}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Items
            </button>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">Features:</div>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 grid grid-cols-2 md:grid-cols-4 gap-2">
          <li>Track stock levels</li>
          <li>Add new products</li>
          <li>Update product information</li>
          <li>Monitor low stock alerts</li>
        </ul>
      </div>
    </div>
  );
};

export default InventoryFilters;
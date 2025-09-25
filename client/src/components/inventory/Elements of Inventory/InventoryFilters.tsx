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
  activeSection?: string;
  setActiveSection?: (section: string) => void;
  onAddCategory?: () => void;
  showTabsAndTitle?: boolean;
}

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  onAddItem,
  totalItems = 0,
  activeSection = 'inventory',
  setActiveSection = () => {},
  onAddCategory = () => {},
  showTabsAndTitle = true,
}) => {
  // Handle add button click
  const handleAddClick = () => {
    if (activeSection === 'category' && onAddCategory) {
      onAddCategory();
    } else {
      onAddItem();
    }
  };

  // Add Button Text
  const addButtonText =
    activeSection === 'inventory'
      ? 'Add Product'
      : 'Add Category';

  // Search Placeholder Text
  const searchPlaceholder =
    activeSection === 'inventory'
      ? 'Search Items'
      : 'Search Categories';

  return (
    <div className="mb-6">
      {/* Navigation Tabs */}
      {showTabsAndTitle && (
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveSection('inventory')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none rounded-t ${
                activeSection === 'inventory'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inventory
            </button>

            <button
              onClick={() => setActiveSection('sales')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none rounded-t ${
                activeSection === 'sales'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sales
            </button>

            <button
              onClick={() => setActiveSection('category')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none rounded-t ${
                activeSection === 'category'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categories
            </button>
          </nav>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between py-4">
        {/* Title */}
        {showTabsAndTitle && (
          <h2 className="text-xl font-semibold text-gray-900">
            {activeSection === 'inventory'
              ? `Inventory (${totalItems} items)`
              : 'Categories'}
          </h2>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none w-64 transition-all bg-gray-50"
            />
          </div>

          {/* Category Filter - only for inventory */}
          {activeSection === 'inventory' && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-white focus:outline-none bg-blue-600 text-white font-medium transition-all appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          )}

          {/* Add Button */}
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            {addButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;
import React from 'react';
import { Search, Plus } from 'lucide-react';

interface CategoryFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddCategory?: () => void;
  title?: string;
  searchPlaceholder?: string;
  addButtonText?: string;
  showTitle?: boolean;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  searchQuery,
  onSearchChange,
  onAddCategory,
  title = 'Category',
  searchPlaceholder = 'Search Categories',
  addButtonText = 'Add Category',
  showTitle = true,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 mt-6">
      {/* Left side - Category Title and Search Bar */}
      <div className="flex items-center gap-4">
        {showTitle && (
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        )}
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02367B] focus:border-transparent w-64"
          />
        </div>
      </div>
      
      {/* Right side - Add Button only */}
      <div className="flex items-center">
        {/* Add Category Button */}
        {onAddCategory && (
          <button
            onClick={onAddCategory}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#02367B] text-white text-sm font-medium rounded-lg hover:bg-[#1C4A9E] focus:outline-none flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            {addButtonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryFilters;
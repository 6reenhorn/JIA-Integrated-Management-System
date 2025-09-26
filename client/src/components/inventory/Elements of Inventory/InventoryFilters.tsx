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
  sections?: Array<{
    id: string;
    label: string;
    key: string;
  }>;
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
  sections = [
    { id: 'inventory', label: 'Inventory', key: 'inventory' },
    { id: 'sales', label: 'Sales', key: 'sales' },
    { id: 'category', label: 'Categories', key: 'category' },
  ],
}) => {
  // Handle add button click
  const handleAddClick = () => {
    if (activeSection === 'category' && onAddCategory) {
      onAddCategory();
    } else {
      onAddItem();
    }
  };

  // Dynamic configuration based on active section
  const getSectionConfig = () => {
    const currentSection = sections.find(section => section.id === activeSection);
    
    switch (activeSection) {
      case 'inventory':
        return {
          addButtonText: 'Add Product',
          searchPlaceholder: 'Q search',
          title: `Inventory (${totalItems} items)`,
          showCategoryFilter: true,
        };
      case 'sales':
        return {
          addButtonText: 'Add Sale',
          searchPlaceholder: 'Q search',
          title: 'Sales',
          showCategoryFilter: false,
        };
      case 'category':
        return {
          addButtonText: 'Add Category',
          searchPlaceholder: 'Q search',
          title: 'Categories',
          showCategoryFilter: false,
        };
      default:
        return {
          addButtonText: currentSection?.label ? `Add ${currentSection.label}` : 'Add Item',
          searchPlaceholder: 'Q search',
          title: currentSection?.label || 'Items',
          showCategoryFilter: activeSection === 'inventory',
        };
    }
  };

  const config = getSectionConfig();

  return (
    <div className="mb-6">
      {/* Navigation Tabs - Only show if explicitly requested */}
      {showTabsAndTitle && (
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none rounded-t ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between py-4">
        {/* Left side: Title and Search */}
        <div className="flex items-center gap-6">
          {/* Title - Always show for inventory section */}
          {activeSection === 'inventory' ? (
            <h2 className="text-xl font-semibold text-gray-900 whitespace-nowrap">
              {config.title}
            </h2>
          ) : showTabsAndTitle ? (
            <h2 className="text-xl font-semibold text-gray-900 whitespace-nowrap">
              {config.title}
            </h2>
          ) : null}

          {/* Search - Moved to left side */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={config.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:outline-none w-64 transition-all bg-gray-50"
            />
          </div>
        </div>

        {/* Right side: Category Filter and Add Button */}
        <div className="flex items-center gap-3">
          {/* Category Filter - conditionally shown */}
          {config.showCategoryFilter && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-[#02367B] rounded-md focus:ring-2 focus:ring-[#02367B] focus:border-white focus:outline-none bg-[#02367B] text-white font-medium transition-all appearance-none cursor-pointer"
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
            className="flex items-center gap-2 px-4 py-2.5 bg-[#02367B] text-white rounded-md hover:bg-[#022a5c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#02367B] focus:ring-offset-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            {config.addButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;
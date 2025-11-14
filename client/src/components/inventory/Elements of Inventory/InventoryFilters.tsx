import React, { useState, useRef, useEffect } from 'react';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle add button click
  const handleAddClick = () => {
    if (activeSection === 'category' && onAddCategory) {
      onAddCategory();
    } else {
      onAddItem();
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Dynamic configuration based on active section
  const getSectionConfig = () => {
    const currentSection = sections.find(section => section.id === activeSection);
    
    switch (activeSection) {
      case 'inventory':
        return {
          addButtonText: 'Add Product',
          searchPlaceholder: 'Search Items',
          title: `Inventory`,
          showCategoryFilter: true,
        };
      case 'sales':
        return {
          addButtonText: 'Add Sale',
          searchPlaceholder: 'Search Sales',
          title: 'Sales',
          showCategoryFilter: false,
        };
      case 'category':
        return {
          addButtonText: 'Add Category',
          searchPlaceholder: 'Search Categories',
          title: 'Categories',
          showCategoryFilter: false,
        };
      default:
        return {
          addButtonText: currentSection?.label ? `Add ${currentSection.label}` : 'Add Item',
          searchPlaceholder: 'Search',
          title: currentSection?.label || 'Items',
          showCategoryFilter: activeSection === 'inventory',
        };
    }
  };

  const config = getSectionConfig();

  // Get display text for selected category
  const getDisplayText = () => {
    if (selectedCategory === 'all') return 'All Categories';
    return categories.find(cat => cat === selectedCategory) || 'All Categories';
  };

  return (
    <div className="w-full">
      {/* Navigation Tabs - Only show if explicitly requested */}
      {showTabsAndTitle && (
        <div className="border-b border-gray-200 mt-6">
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
      <div className="flex items-center justify-between mt-6 w-full">
        {/* Left side: Title and Search */}
        <div className="flex items-center gap-4">
          {/* Title - Always show for inventory section */}
          {activeSection === 'inventory' ? (
            <h2 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
              {config.title}
            </h2>
          ) : showTabsAndTitle ? (
            <h2 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
              {config.title}
            </h2>
          ) : null}

          {/* Search - Left side */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={config.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02367B] focus:border-transparent w-64"
            />
          </div>
        </div>

        {/* Right side: Category Filter and Add Button */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Custom Category Dropdown - conditionally shown */}
          {config.showCategoryFilter && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02367B] focus:border-transparent bg-gray-100 cursor-pointer min-w-[140px]"
              >
                <span className="truncate">{getDisplayText()}</span>
                <svg 
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`text-gray-500 transition-transform duration-200 ease-in-out flex-shrink-0 ml-2 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                >
                  <polygon points="4,6 12,6 8,12" fill="currentColor" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-100 border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => handleCategorySelect('all')}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                      selectedCategory === 'all' ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                        selectedCategory === category ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Button */}
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#02367B] text-white text-sm font-medium rounded-lg hover:bg-[#1C4A9E] focus:outline-none flex-shrink-0"
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
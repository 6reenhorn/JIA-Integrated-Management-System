import React, { useMemo } from 'react';
import MainLayoutCard from '../../layout/MainLayoutCard';
import LayoutCard from '../../layout/LayoutCard';

interface Category {
  name: string;
  productCount: number;
  totalStock: number;
  totalValue: number;
  color?: string;
}

interface InventoryItem {
  id: number;
  productName: string;
  category: string;
  stock: number;
  status: string;
  productPrice: number;
  totalAmount: number;
}

interface CategoryContentProps {
  categories: Category[];
  currentPage: number;
  totalPages: number;
  filteredCount: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onViewProducts?: (categoryName: string) => void;
  showHeaderStats?: boolean;
  onAddCategory?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  // New props for MainLayoutCard integration
  sections?: { label: string; key: string }[];
  activeSection?: string;
  onSectionChange?: (key: string) => void;
  // Pass inventory items to calculate stats
  inventoryItems?: InventoryItem[];
}

const CategoryContent: React.FC<CategoryContentProps> = ({
  categories,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onViewProducts,
  showHeaderStats = true,
  onAddCategory,
  searchQuery = '',
  onSearchChange,
  // MainLayoutCard props
  sections,
  activeSection,
  onSectionChange,
  inventoryItems = []
}) => {
  const defaultColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
  
  // Calculate category stats from inventory items
  const categoryStats = useMemo(() => {
    const totalCategories = Array.from(new Set(inventoryItems.map(item => item.category))).length;
    const totalProducts = inventoryItems.length;
    const totalStock = inventoryItems.reduce((sum, item) => sum + item.stock, 0);
    const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalAmount, 0);
    
    return {
      totalCategories,
      totalProducts,
      totalStock,
      totalValue
    };
  }, [inventoryItems]);

  const categoryContent = (
    <>
      {/* Categories Section */}
      <div className="bg-none rounded-l p-0 mt-4">
        {/* Header with Category Title, Search, and Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Left side - Category Title and Search Bar */}
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Category
            </h3>
            
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search Categories"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#02367B] text-white text-sm font-medium rounded-lg hover:bg-[#01295a] transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Category
              </button>
            )}
          </div>
        </div>
        
        {/* Category Cards Grid - Now using LayoutCard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-1 mb-8">
          {categories.map((category, index) => (
            <LayoutCard 
              key={index} 
            >
              {/* Category Header with Color Dot */}
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color || defaultColors[index % defaultColors.length] }}
                />
                <h4 className="text-lg font-semibold text-gray-900">{category.name}</h4>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Product Count */}
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900 mb-1">{category.productCount}</p>
                  <p className="text-sm text-gray-500">Product{category.productCount !== 1 ? 's' : ''}</p>
                </div>
                
                {/* Total Stock */}
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900 mb-1">{category.totalStock}</p>
                  <p className="text-sm text-gray-500">Total Stock</p>
                </div>
              </div>
              
              {/* Category Value */}
              <div className="pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Category Value</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ₱{category.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                
                {/* View Products Button */}
                {onViewProducts && (
                  <button
                    onClick={() => onViewProducts(category.name)}
                    className="w-full text-[#02367B] hover:text-[#01295a] text-sm font-medium underline transition-colors"
                  >
                    View Products
                  </button>
                )}
              </div>
            </LayoutCard>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-6">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 border border-gray-500 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 text-sm font-medium border rounded transition-colors ${
                    currentPage === pageNum
                      ? 'bg-[#02367B] text-white border-[#02367B]'
                      : 'text-gray-500 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 border border-gray-500 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Header Stats Cards - Only show if showHeaderStats is true */}
      {showHeaderStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Total Categories Card */}
          <LayoutCard>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Categories</h3>
            <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
          </LayoutCard>

          {/* Total Products Card */}
          <LayoutCard>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900">{categoryStats.totalProducts}</p>
            <p className="text-xs text-gray-400 mt-1">Across all categories</p>
          </LayoutCard>

          {/* Total Stock Card */}
          <LayoutCard>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Stock</h3>
            <p className="text-3xl font-bold text-gray-900">{categoryStats.totalStock}</p>
          </LayoutCard>

          {/* Total Value Card */}
          <LayoutCard>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Value</h3>
            <p className="text-3xl font-bold text-gray-900">
              ₱{categoryStats.totalValue.toLocaleString()}
            </p>
          </LayoutCard>
        </div>
      )}
      
      <MainLayoutCard
        sections={sections}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      >
        {categoryContent}
      </MainLayoutCard>
    </>
  );
};

export default CategoryContent;
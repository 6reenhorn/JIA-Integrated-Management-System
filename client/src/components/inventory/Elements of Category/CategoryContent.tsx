import React from 'react';

interface Category {
  name: string;
  productCount: number;
  totalStock: number;
  totalValue: number;
  color?: string; // Add color property
}

interface CategoryContentProps {
  categories: Category[];
  currentPage: number;
  totalPages: number;
  filteredCount: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onViewProducts?: (categoryName: string) => void;
  showHeaderStats?: boolean; // Add this prop to control header stats visibility
}

const CategoryContent: React.FC<CategoryContentProps> = ({
  categories,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onViewProducts,
  showHeaderStats = true // Default to true for backward compatibility
}) => {
  // Default colors if not provided
  const defaultColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
  
  const totalProducts = categories.reduce((sum, category) => sum + category.productCount, 0);

  return (
    <>
      {/* Header Stats Cards - Only show if showHeaderStats is true */}
      {showHeaderStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Total Categories Card */}
          <div className="bg-gray-100 rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Categories</h3>
            <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
          </div>

          {/* Total Products Card */}
          <div className="bg-gray-100 rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
            <p className="text-xs text-gray-400 mt-1">Across all categories</p>
          </div>

          {/* Total Stock Card */}
          <div className="bg-gray-100 rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Stock</h3>
            <p className="text-3xl font-bold text-gray-900">
              {categories.reduce((sum, category) => sum + category.totalStock, 0)}
            </p>
          </div>

          {/* Total Value Card */}
          <div className="bg-gray-100 rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Value</h3>
            <p className="text-3xl font-bold text-gray-900">
              ₱{categories.reduce((sum, category) => sum + category.totalValue, 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Category ({categories.length} Categories)</h3>
          </div>
        </div>
        
        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {categories.map((category, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
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
              <div className="border-t border-gray-200 pt-4">
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
                    className="w-full text-[#02367B] hover:text-[#02367B] text-sm font-medium underline"
                  >
                    View Products
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className={`w-8 h-8 text-sm font-medium rounded ${
                    currentPage === pageNum
                      ? 'bg-[#02367B] text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryContent;
import React, { useMemo, useState } from 'react';
import { Trash2, AlertCircle, X } from 'lucide-react';
import MainLayoutCard from '../../layout/MainLayoutCard';
import LayoutCard from '../../layout/LayoutCard';
import CategoryActions from './CategoryActions';
import CategoryFilters from './CategoryFilters';
import DeleteCategoryModal from '../../../modals/Inventory/DeleteCategoryModal';

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
  sections?: { label: string; key: string }[];
  activeSection?: string;
  onSectionChange?: (key: string) => void;
  inventoryItems?: InventoryItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onDeleteCategory?: (categoryName: string) => void;
}

// Error Modal Component
const ErrorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
}> = ({ isOpen, onClose, errorMessage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-auto animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Cannot Delete Category</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
          
          <p className="text-sm text-gray-600">
            To delete this category, you must first remove or reassign all products that belong to it.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 pt-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#02367B] text-white rounded-md hover:bg-[#02367B]/90 transition-colors font-medium text-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoryContent: React.FC<CategoryContentProps> = ({
  categories,
  currentPage,
  totalCount,
  onPageChange,
  onViewProducts,
  showHeaderStats = true,
  onAddCategory,
  searchQuery = '',
  onSearchChange,
  sections,
  activeSection,
  onSectionChange,
  inventoryItems = [],
  isLoading = false,
  onRefresh,
  isRefreshing = false,
  onDeleteCategory
}) => {
  const defaultColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
  
  const ITEMS_PER_PAGE = 9;
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return categories.slice(startIndex, endIndex);
  }, [categories, currentPage]);

  const actualTotalPages = Math.ceil(categories.length / ITEMS_PER_PAGE) || 1;

  const handleDeleteClick = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (categoryName: string) => {
    if (onDeleteCategory) {
      setIsDeleting(true);
      try {
        await onDeleteCategory(categoryName);
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
      } catch (error: unknown) {
        console.error('Error deleting category:', error);
        
        // Close delete modal
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
        
        // Show error modal with custom message
        let errorMsg = 'Failed to delete category. Please try again.';
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
          errorMsg = axiosError.response?.data?.error || axiosError.message || errorMsg;
        } else if (error instanceof Error) {
          errorMsg = error.message;
        }
        
        setErrorMessage(errorMsg);
        setErrorModalOpen(true);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const categoryContent = (
    <>
      <div className="bg-none rounded-l p-0 mt-4">
        <CategoryFilters
          searchQuery={searchQuery}
          onSearchChange={onSearchChange ?? (() => {})}
          onAddCategory={onAddCategory}
          title="Category"
          searchPlaceholder="Search Categories"
          addButtonText="Add Category"
          showTitle={true}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
        
        {isLoading ? (
          <div className="h-[392px] overflow-hidden p-6 mt-1 mb-8 border-t border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: Math.min(categories.length || 3, ITEMS_PER_PAGE) }).map((_, index) => (
                <LayoutCard key={`skeleton-${index}`}>
                  {/* Category Header Skeleton */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-3 h-3 rounded-full bg-gray-200 animate-pulse" />
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                    </div>
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  
                  {/* Stats Grid Skeleton */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-center">
                      <div className="h-9 bg-gray-200 rounded animate-pulse mb-2 mx-auto w-16"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-20"></div>
                    </div>
                    
                    <div className="text-center">
                      <div className="h-9 bg-gray-200 rounded animate-pulse mb-2 mx-auto w-16"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-24"></div>
                    </div>
                  </div>
                  
                  {/* Category Value Skeleton */}
                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                    </div>
                    
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto"></div>
                  </div>
                </LayoutCard>
              ))}
            </div>
          </div>
        ) : paginatedCategories.length === 0 ? (
          <div className="h-[392px] flex items-center justify-center border-t border-b border-gray-200 mt-1 mb-8">
            <p className="text-gray-500">
              {categories.length === 0 
                ? "No categories found. Add your first category to get started."
                : "No categories match your search."}
            </p>
          </div>
        ) : (
          <div className="h-[392px] overflow-y-auto p-6 mt-1 mb-8 border-t border-b border-gray-200 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCategories.map((category, index) => {
                const actualIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                return (
                  <LayoutCard key={`${category.name}-${actualIndex}`}>
                    {/* Category Header with Color Dot and Delete Button */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color || defaultColors[actualIndex % defaultColors.length] }}
                        />
                        <h4 className="text-lg font-semibold text-gray-900">{category.name}</h4>
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteClick(category, e)}
                        className="p-1.5 hover:bg-red-50 rounded-md transition-colors group"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4 text-gray-800 group-hover:text-red-600" />
                      </button>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-900 mb-1">{category.productCount}</p>
                        <p className="text-sm text-gray-500">Product{category.productCount !== 1 ? 's' : ''}</p>
                      </div>
                      
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
                );
              })}
            </div>
          </div>
        )}

        <CategoryActions
          currentPage={currentPage}
          totalPages={actualTotalPages}
          onPageChange={onPageChange}
        />
      </div>

      {/* Delete Category Modal */}
      <DeleteCategoryModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirmDelete={handleConfirmDelete}
        category={categoryToDelete}
        isDeleting={isDeleting}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errorMessage={errorMessage}
      />
    </>
  );

  return (
    <>
      {showHeaderStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <LayoutCard>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Categories</h3>
            <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
          </LayoutCard>

          <LayoutCard>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900">{categoryStats.totalProducts}</p>
            <p className="text-xs text-gray-400 mt-1">Across all categories</p>
          </LayoutCard>

          <LayoutCard>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Stock</h3>
            <p className="text-3xl font-bold text-gray-900">{categoryStats.totalStock}</p>
          </LayoutCard>

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
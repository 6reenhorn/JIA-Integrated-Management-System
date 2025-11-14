import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { InventoryItem } from '../../types/inventory_types';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: InventoryItem) => void;
  initialData?: InventoryItem;
  categories: string[];
  categoryColors: Record<string, string>;
  isUpdating?: boolean;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  categoryColors,
  isUpdating = false
}) => {
  const [formData, setFormData] = useState<InventoryItem>({
    id: 0,
    productName: '',
    category: '',
    stock: 0,
    status: 'Good',
    productPrice: 0,
    totalAmount: 0,
    description: '',
    minimumStock: 5
  });

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isUpdating) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, isUpdating]);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        ...initialData,
        description: initialData.description || '',
        minimumStock: initialData.minimumStock || 5
      });
    }
  }, [initialData, isOpen]);

  const toggleCategoryDropdown = () => {
    if (!isUpdating) {
      setIsSelectOpen(!isSelectOpen);
    }
  };

  const handleCategorySelect = (category: string) => {
    if (!isUpdating) {
      setFormData(prev => ({ ...prev, category }));
      setIsSelectOpen(false);
    }
  };

  const handleInputChange = (field: keyof InventoryItem, value: string | number) => {
    setFormData((prev: InventoryItem) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (isUpdating) return;
    
    const minStock = formData.minimumStock || 5;
    const updatedFormData = {
      ...formData,
      totalAmount: formData.stock * formData.productPrice,
      status: formData.stock === 0 ? 'Out Of Stock' : 
              formData.stock <= minStock ? 'Low Stock' : 'Good'
    };
    
    onSave(updatedFormData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Product</h2>
            <p className="text-gray-500 text-sm mt-1">Update the product information and inventory details.</p>
          </div>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02367B] focus:ring-offset-1 rounded-md p-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <div className="px-6 pb-6">
          <div className="space-y-6">
            {/* Product Details Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Product Details</h3>
              
              {/* Product Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  disabled={isUpdating}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={isUpdating}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white transition-all resize-none outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Category and Price Row */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <div className="relative" ref={categoryDropdownRef}>
                    <div
                      onClick={toggleCategoryDropdown}
                      className={`w-full px-3 py-2 pr-8 bg-gray-100 border border-gray-300 rounded-lg text-left transition-all outline-none ${
                        isUpdating 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'cursor-pointer hover:bg-gray-200'
                      } ${
                        isSelectOpen ? 'ring-2 ring-[#02367B] border-[#02367B] bg-white' : 'focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white'
                      }`}
                    >
                      <div className="flex items-center">
                        {formData.category ? (
                          <>
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: categoryColors[formData.category] || '#6B7280' }}
                            ></div>
                            {formData.category}
                          </>
                        ) : (
                          <span className="text-gray-500">Select Category</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg 
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className={`text-gray-500 transition-transform duration-200 ease-in-out ${
                          isSelectOpen ? 'rotate-180' : ''
                        }`}
                      >
                        <polygon points="4,6 12,6 8,12" fill="currentColor" />
                      </svg>
                    </div>

                    {!isUpdating && (
                      <div
                        className="dropdown-options absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-48 overflow-y-auto"
                        style={{
                          display: isSelectOpen ? 'block' : 'none',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                      >
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 font-medium text-gray-700 text-center text-sm">
                          Select Category
                        </div>
                        
                        {categories.map((category) => (
                          <div
                            key={category}
                            onClick={() => handleCategorySelect(category)}
                            className="px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-200 last:border-b-0 flex items-center transition-colors cursor-pointer"
                          >
                            <div 
                              className="w-3 h-3 rounded-full mr-3"
                              style={{ backgroundColor: categoryColors[category] || '#6B7280' }}
                            ></div>
                            {category}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₱)
                  </label>
                  <input
                    type="number"
                    value={formData.productPrice || ''}
                    onChange={(e) => handleInputChange('productPrice', parseFloat(e.target.value) || 0)}
                    disabled={isUpdating}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Current Stock and Minimum Stock Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Current Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    value={formData.stock || ''}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    disabled={isUpdating}
                    min="0"
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {/* Minimum Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minimumStock || ''}
                    onChange={(e) => handleInputChange('minimumStock', parseInt(e.target.value) || 0)}
                    disabled={isUpdating}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isUpdating}
                className="px-4 py-1.5 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isUpdating}
                className="px-4 py-1.5 bg-[#02367B] text-white rounded-md hover:bg-[#02367B]/90 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#02367B] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  'Update Product'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
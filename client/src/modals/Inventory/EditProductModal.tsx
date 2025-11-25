import React, { useState, useEffect, useRef } from 'react';
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
  const [focusedCategoryOption, setFocusedCategoryOption] = useState(0);
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
      <div className="bg-gray-100 shadow-md rounded-md p-6 w-[460px] max-h-[750px]">
        <div>
          <h3 className="text-[20px] font-bold">Edit Product</h3>
          <p className="text-[12px]">Update the product information and inventory details.</p>
        </div>
        
        <div className="overflow-y-auto max-h-[550px] mt-4 text-[12px]">
          <div className="flex flex-col gap-3">
            {/* Product Details Section */}
            <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4">
              <h3 className="text-[16px] font-bold">Product Details</h3>
              
              <div className="mt-2">
                <label className="text-[12px] font-bold">Product Name</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  disabled={isUpdating}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="mt-2">
                <label className="text-[12px] font-bold">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={isUpdating}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="dropdown relative" ref={categoryDropdownRef}>
                  <p className="text-[12px] font-bold">Category</p>
                  <div
                    className={`dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-md px-4 text-gray-600 cursor-pointer h-[29px] ${
                      isUpdating 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-200'
                    }`}
                    onClick={toggleCategoryDropdown}
                    onKeyDown={(e) => {
                      if (!isUpdating && (e.key === 'Enter' || e.key === ' ')) {
                        toggleCategoryDropdown();
                        e.preventDefault();
                      }
                    }}
                    tabIndex={isUpdating ? -1 : 0}
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
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className={`transition-transform ${isSelectOpen ? 'rotate-180' : ''}`}
                    >
                      <polygon points="4,6 12,6 8,12" fill="currentColor" />
                    </svg>
                  </div>
                  <div
                    className="dropdown-options mt-1 rounded-md"
                    style={{
                      display: isSelectOpen && !isUpdating ? 'block' : 'none',
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      zIndex: 10,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setFocusedCategoryOption((prev) => (prev + 1) % categories.length);
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setFocusedCategoryOption((prev) => (prev - 1 + categories.length) % categories.length);
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCategorySelect(categories[focusedCategoryOption]);
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        setIsSelectOpen(false);
                      }
                    }}
                    tabIndex={isSelectOpen && !isUpdating ? 0 : -1}
                  >
                    {categories.map((category, idx) => (
                      <div
                        key={category}
                        className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                          focusedCategoryOption === idx ? 'bg-blue-100' : ''
                        }`}
                        onClick={() => handleCategorySelect(category)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCategorySelect(category);
                          }
                        }}
                        tabIndex={isSelectOpen && !isUpdating ? 0 : -1}
                      >
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: categoryColors[category] || '#6B7280' }}
                        ></div>
                        {category}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-bold">Price (₱)</label>
                  <input
                    type="number"
                    value={formData.productPrice || ''}
                    onChange={(e) => handleInputChange('productPrice', parseFloat(e.target.value) || 0)}
                    disabled={isUpdating}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="text-[12px] font-bold">Current Stock</label>
                  <input
                    type="number"
                    value={formData.stock || ''}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    disabled={isUpdating}
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold">Minimum Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minimumStock || ''}
                    onChange={(e) => handleInputChange('minimumStock', parseInt(e.target.value) || 0)}
                    disabled={isUpdating}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex justify-end gap-2 mt-4 text-[12px] font-bold">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="border border-gray-300 hover:bg-gray-200 rounded-md px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isUpdating}
            className="bg-[#02367B] text-white rounded-md px-3 py-1 hover:bg-[#1C4A9E] border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
  );
};

export default EditProductModal;
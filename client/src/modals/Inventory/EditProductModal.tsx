import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { InventoryItem } from '../../types/inventory_types';
import Portal from '../../components/common/Portal';

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

  const [productPriceDisplay, setProductPriceDisplay] = useState<string>('');
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const [wasUpdating, setWasUpdating] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

// Close dropdown when clicking outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    // Close category dropdown when clicking outside
    if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
      setIsSelectOpen(false);
    }
    
    // Close modal when clicking outside (on the backdrop)
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      if (!isUpdating) {
        setIsClosing(true);
        setTimeout(() => {
          onClose();
          setIsClosing(false);
        }, 300);
      }
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isUpdating, onClose]);

// Handle escape key
useEffect(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !isUpdating) {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 300);
    }
  };

  if (isOpen) {
    document.addEventListener('keydown', handleEscape);
  }

  return () => {
    document.removeEventListener('keydown', handleEscape);
  };
}, [isOpen, isUpdating, onClose]);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        ...initialData,
        description: initialData.description || '',
        minimumStock: initialData.minimumStock || 5
      });
      // Set the display value for price
      if (initialData.productPrice) {
        setProductPriceDisplay(
          initialData.productPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        );
      } else {
        setProductPriceDisplay('');
      }
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setShowValidationAlert(false);
      setMissingFields([]);
    }
  }, [isOpen]);

    // Watch for update completion
  useEffect(() => {
    if (wasUpdating && !isUpdating && isOpen) {
      // Update just completed successfully, start closing animation
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        setIsClosing(false);
        setWasUpdating(false);
      }, 300);
    }
  }, [isUpdating, wasUpdating, isOpen, onClose]);

  // Track when update starts
  useEffect(() => {
    if (isUpdating) {
      setWasUpdating(true);
    }
  }, [isUpdating]);

  const toggleCategoryDropdown = () => {
    if (!isUpdating) {
      setIsSelectOpen(!isSelectOpen);
    }
  };

  const handleCategorySelect = (category: string) => {
    if (!isUpdating) {
      setFormData(prev => ({ ...prev, category }));
      setIsSelectOpen(false);
      
      // Hide validation alert when user makes changes
      if (showValidationAlert) {
        setShowValidationAlert(false);
      }
    }
  };

  const formatNumberWithCommas = (value: string): string => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, 2)}` : parts[0];
  };

  const handleInputChange = (field: keyof InventoryItem, value: string | number) => {
    setFormData((prev: InventoryItem) => ({
      ...prev,
      [field]: value
    }));
    
    // Hide validation alert when user makes changes
    if (showValidationAlert) {
      setShowValidationAlert(false);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    
    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    const cleanedNumeric = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('') 
      : numericValue;
    
    // Format the cleaned numeric value
    const formattedValue = formatNumberWithCommas(cleanedNumeric);
    
    setProductPriceDisplay(formattedValue);
    handleInputChange('productPrice', cleanedNumeric === '' ? 0 : parseFloat(cleanedNumeric) || 0);
  };

  const validateForm = () => {
    const missing: string[] = [];

    if (!formData.productName.trim()) {
      missing.push('Product Name');
    }
    if (!formData.category) {
      missing.push('Category');
    }
    if (!formData.productPrice || formData.productPrice <= 0) {
      missing.push('Price');
    }
    if (formData.stock === undefined || formData.stock === null) {
      missing.push('Current Stock');
    }

    if (missing.length > 0) {
      setMissingFields(missing);
      setShowValidationAlert(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowValidationAlert(false);
      }, 5000);
      
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (isUpdating) return;
    
    if (!validateForm()) {
      return;
    }
    
    const minStock = formData.minimumStock || 5;
    const updatedFormData = {
      ...formData,
      totalAmount: formData.stock * formData.productPrice,
      status: formData.stock === 0 ? 'Out Of Stock' : 
              formData.stock <= minStock ? 'Low Stock' : 'Good'
    };
    
    onSave(updatedFormData);
    
  };

  const handleCancel = () => {
    if (isUpdating) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div 
          ref={modalRef}
          className={`bg-gray-100 shadow-md rounded-md p-6 w-[460px] max-h-[750px] ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}
        >
          <div>
            <h3 className="text-[20px] font-bold">Edit Product</h3>
            <p className="text-[12px]">Update the product information and inventory details.</p>
          </div>

          {/* Validation Alert */}
          {showValidationAlert && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 animate-modal-in">
              <div className="flex gap-2">
                <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-red-800 mb-1">
                    Please fill in all required fields
                  </p>
                  <p className="text-xs text-red-700">
                    Missing: {missingFields.join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => setShowValidationAlert(false)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <div className="overflow-y-auto max-h-[550px] mt-4 text-[12px]">
            <div className="flex flex-col gap-3">
              {/* Product Details Section */}
              <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4">
                <h3 className="text-[16px] font-bold">Product Details</h3>
                
                <div className="mt-2">
                  <label className="text-[12px] font-bold">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    disabled={isUpdating}
                    className={`w-full border rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                      showValidationAlert && !formData.productName.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
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
                    <p className="text-[12px] font-bold">
                      Category
                    </p>
                    <div
                      className={`dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full rounded-md px-4 text-gray-600 cursor-pointer h-[29px] ${
                        isUpdating 
                          ? 'opacity-50 cursor-not-allowed border-[#E5E7EB]' 
                          : showValidationAlert && !formData.category
                          ? 'border-red-300 bg-red-50'
                          : 'border-[#E5E7EB] hover:bg-gray-200'
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
                      className="dropdown-options mt-1 rounded-md [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                      style={{
                        display: isSelectOpen && !isUpdating ? 'block' : 'none',
                        position: 'absolute',
                        top: 'auto',
                        bottom: 'calc(60% + 5px)',
                        left: 0,
                        right: 0,
                        transform: 'translateY(0)',
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        zIndex: 10,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        maxHeight: '190px',
                        overflowY: 'scroll'
                      }}
                    >
                      {categories.length === 0 ? (
                        <div className="px-4 py-2 text-gray-500 text-center">
                          No categories available
                        </div>
                      ) : (
                        [...categories].reverse().map((category) => (
                          <div
                            key={category}
                            className="option px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
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
                        ))
                      )}
                    </div>
                  </div>

                <div>
                  <label className="text-[12px] font-bold">
                    Price (₱)
                  </label>
                  <input
                    type="text"
                    value={productPriceDisplay}
                    onChange={handlePriceChange}
                    disabled={isUpdating}
                    placeholder="0.00"
                    className={`w-full border rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                      showValidationAlert && (!formData.productPrice || formData.productPrice <= 0) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="text-[12px] font-bold">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      value={formData.stock || ''}
                      onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                      disabled={isUpdating}
                      min="0"
                      className={`w-full border rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        showValidationAlert && (formData.stock === undefined || formData.stock === null) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
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
              onClick={handleCancel}
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
    </Portal>
  );
};

export default EditProductModal;
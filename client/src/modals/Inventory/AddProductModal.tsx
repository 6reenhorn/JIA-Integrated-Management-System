import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Portal from '../../components/common/Portal';

interface ProductFormData {
  productName: string;
  category: string;
  productPrice: number;
  quantity: number;
  minimumStock: number;
  description?: string;
  status?: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (productData: ProductFormData) => void;
  categories: string[];
  categoryColors: Record<string, string>;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  categories,
  categoryColors
}) => {
  const [formData, setFormData] = useState<{
    productName: string;
    category: string;
    productPrice: number | string;
    quantity: number | string;
    minimumStock: number | string;
    description?: string;
    productPriceDisplay?: string; 
  }>({
    productName: '',
    category: '',
    productPrice: '',
    quantity: '',
    minimumStock: '',
    description: '',
    productPriceDisplay: ''
  });

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
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

  // Reset closing state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setShowValidationAlert(false);
      setMissingFields([]);
    }
  }, [isOpen]);

  const toggleCategoryDropdown = () => {
    setIsSelectOpen(!isSelectOpen);
  };

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
    setIsSelectOpen(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setShowValidationAlert(false);
      setMissingFields([]);
    }, 300);
  };

  const validateForm = (): boolean => {
    const missing: string[] = [];

    if (!formData.productName.trim()) {
      missing.push('Product Name');
    }
    if (!formData.category) {
      missing.push('Category');
    }
    if (!formData.productPrice || formData.productPrice === '') {
      missing.push('Price');
    }
    if (formData.quantity === '') {
      missing.push('Current Stock');
    }

    if (missing.length > 0) {
      setMissingFields(missing);
      setShowValidationAlert(true);
      
      // Auto-hide alert after 5 seconds
      setTimeout(() => {
        setShowValidationAlert(false);
      }, 5000);
      
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    const quantity = Number(formData.quantity) || 0;
    const minimumStock = Number(formData.minimumStock) || 0;
    
    // Determine status based on quantity
    let status = 'Good';
    if (quantity === 0) {
      status = 'Out Of Stock';
    } else if (quantity <= minimumStock) {
      status = 'Low Stock';
    }

    const productData: ProductFormData = {
      productName: formData.productName,
      category: formData.category,
      productPrice: Number(formData.productPrice) || 0,
      quantity: quantity,
      minimumStock: minimumStock,
      description: formData.description,
      status
    };

    onAddProduct(productData);
    
    // Reset form
    setFormData({
      productName: '',
      category: '',
      productPrice: '',
      quantity: '',
      minimumStock: '',
      description: ''
    });
    
    handleClose();
  };

  const formatNumberWithCommas = (value: string): string => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, 2)}` : parts[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Hide validation alert when user starts typing
    if (showValidationAlert) {
      setShowValidationAlert(false);
    }
    
    if (name === 'productPrice') {
      const numericValue = value.replace(/,/g, '');
      const formattedValue = formatNumberWithCommas(value);
      
      setFormData(prev => ({
        ...prev,
        productPrice: numericValue === '' ? '' : numericValue,
        productPriceDisplay: formattedValue
      }));
    } else if (name === 'quantity' || name === 'minimumStock') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <div 
          className={`bg-gray-100 shadow-md rounded-md p-6 w-[460px] max-h-[750px] ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <h3 className="text-[20px] font-bold">Add New Product</h3>
            <p className="text-[12px]">Add a new product to your inventory with details and pricing.</p>
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
          
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[550px] mt-4 text-[12px] flex flex-col gap-3">
            {/* Product Details Section */}
            <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4">
              <h3 className="text-[16px] font-bold">Product Details</h3>
              
              <div className="mt-2">
                <label className="text-[12px] font-bold">
                  Product Name
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className={`w-full border rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none ${
                    showValidationAlert && !formData.productName.trim() 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div className="mt-2">
                <label className="text-[12px] font-bold">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="dropdown relative" ref={categoryDropdownRef}>
                  <p className="text-[12px] font-bold">Category</p>
                  <div className="relative">
                    <div
                      className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-md px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[32px]"
                      onClick={toggleCategoryDropdown}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          toggleCategoryDropdown();
                          e.preventDefault();
                        }
                      }}
                      tabIndex={0}
                    >
                      <div className="flex items-center min-h-0">
                        {formData.category ? (
                          <>
                            <div 
                              className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                              style={{ backgroundColor: categoryColors[formData.category] || '#6B7280' }}
                            ></div>
                            <span className="truncate">{formData.category}</span>
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
                        className={`transition-transform flex-shrink-0 ${isSelectOpen ? 'rotate-180' : ''}`}
                      >
                        <polygon points="4,6 12,6 8,12" fill="currentColor" />
                      </svg>
                    </div>
                    
                    <div
                      className="dropdown-options rounded-md [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                      style={{
                        display: isSelectOpen ? 'block' : 'none',
                        position: 'absolute',
                        top: 'auto',
                        bottom: 'calc(100% + 4px)',
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
                        maxHeight: categories.length <= 5 ? 'fit-content' : '190px',
                        overflowY: categories.length <= 5 ? 'visible' : 'auto'
                      }}
                    >
                    {[...categories].reverse().map((category) => (
                      <div
                        key={category}
                        className="option px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                        onClick={() => handleCategorySelect(category)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCategorySelect(category);
                          }
                        }}
                        tabIndex={0}
                      >
                        <div 
                          className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                          style={{ backgroundColor: categoryColors[category] || '#6B7280' }}
                        ></div>
                        <span className="truncate">{category}</span>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-bold">
                    Price (₱) 
                  </label>
                  <input
                    type="text"
                    name="productPrice"
                    value={formData.productPriceDisplay || ''}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`w-full border rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none ${
                      showValidationAlert && (!formData.productPrice || formData.productPrice === '') 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
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
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className={`w-full border rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      showValidationAlert && formData.quantity === '' 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold">Minimum Stock</label>
                  <input
                    type="number"
                    name="minimumStock"
                    value={formData.minimumStock}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex justify-end gap-2 mt-4 text-[12px] font-bold">
              <button
                type="button"
                onClick={handleClose}
                className="border border-gray-300 hover:bg-gray-200 rounded-md px-3 py-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#02367B] text-white rounded-md px-3 py-1 hover:bg-[#1C4A9E] border border-gray-300"
              >
                Add Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
};

export default AddProductModal;
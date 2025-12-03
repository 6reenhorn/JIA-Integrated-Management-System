import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import CustomDatePicker from '../../components/common/CustomDatePicker';
import axios from 'axios';
import Portal from '../../components/common/Portal';

interface InventoryProduct {
  id: number;
  productName: string;
  stock: number;
  productPrice: number;
  category: string;
}

interface AddSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSale: (saleData: {
    productName: string;
    quantity: number;
    price: number;
    paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay';
    date: string;
  }) => void;
  onInventoryUpdate?: () => void;
}

// Helper function to format date to MM/dd/yyyy
const formatDateToMMDDYYYY = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

// Helper function to parse MM/dd/yyyy to Date
const parseDateFromMMDDYYYY = (dateString: string): Date | null => {
  if (!dateString) return null;
  const [month, day, year] = dateString.split('/');
  if (!month || !day || !year) return null;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

const AddSalesModal: React.FC<AddSalesModalProps> = ({
  isOpen,
  onClose,
  onAddSale,
  onInventoryUpdate,
}) => {
  const [formData, setFormData] = useState<{
    productName: string;
    quantity: number | string;
    price: number | string;
    paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay';
    date: string;
  }>({
    productName: '',
    quantity: '',
    price: '',
    paymentMethod: 'Cash',
    date: formatDateToMMDDYYYY(new Date()),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [inventoryProducts, setInventoryProducts] = useState<InventoryProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [focusedPaymentOption, setFocusedPaymentOption] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const paymentMethodOptions = ['Cash', 'Gcash', 'PayMaya', 'Juanpay'];

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setFormData({
        productName: '',
        quantity: '',
        price: '',
        paymentMethod: 'Cash',
        date: formatDateToMMDDYYYY(new Date()),
      });
      setErrors({});
      setSelectedProduct(null);
      setProductSearchTerm('');
      setShowValidationAlert(false);
      setMissingFields([]);
      onClose();
      setIsClosing(false);
    }, 300);
  }, [onClose]);

  // Fetch inventory products when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInventoryProducts();
      setShowValidationAlert(false);
      setMissingFields([]);
    }
  }, [isOpen]);

  const fetchInventoryProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await axios.get('http://localhost:3001/api/inventory');
      setInventoryProducts(response.data);
    } catch (err) {
      console.error('Error fetching inventory products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Handle click outside to close dropdowns and modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close payment method dropdown when clicking outside
      if (paymentMethodRef.current && !paymentMethodRef.current.contains(event.target as Node)) {
        setIsPaymentMethodOpen(false);
      }
      
      // Close product dropdown when clicking outside
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setIsProductDropdownOpen(false);
      }
      
      // Close modal when clicking outside (on the backdrop)
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClose]);

  // Format number with commas
  const formatNumberWithCommas = (value: string): string => {
    const numericValue = value.replace(/,/g, '');
    if (!numericValue || isNaN(Number(numericValue))) return '';
    return Number(numericValue).toLocaleString('en-US');
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  // Filter products based on search term
  const filteredProducts = inventoryProducts.filter(product =>
    product.productName.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const handleProductSelect = (product: InventoryProduct) => {
    setSelectedProduct(product);
    setFormData(prev => ({
      ...prev,
      productName: product.productName,
      price: formatNumberWithCommas(product.productPrice.toString()),
    }));
    setProductSearchTerm(product.productName);
    setIsProductDropdownOpen(false);
    
    // Clear error when product is selected
    if (errors.productName) {
      setErrors(prev => ({
        ...prev,
        productName: ''
      }));
    }
    
    // Hide validation alert when user makes changes
    if (showValidationAlert) {
      setShowValidationAlert(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (field === 'quantity' || field === 'price') {
      setFormData(prev => ({
        ...prev,
        [field]: value === '' ? '' : value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Hide validation alert when user starts typing
    if (showValidationAlert) {
      setShowValidationAlert(false);
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const missing: string[] = [];

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
      missing.push('Product Name');
    }

    const quantity = Number(formData.quantity);
    if (!formData.quantity || quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
      missing.push('Quantity');
    } else if (selectedProduct && quantity > selectedProduct.stock) {
      // This is a special case - not a missing field but an invalid value
      newErrors.quantity = `Only ${selectedProduct.stock} items available in stock`;
      missing.push(`Quantity (Max: ${selectedProduct.stock})`);
    }

    const price = Number(formData.price);
    if (!formData.price || price <= 0) {
      newErrors.price = 'Price must be greater than 0';
      missing.push('Price');
    }

    if (!formData.date) {
      newErrors.date = 'Sale date is required';
      missing.push('Sale Date');
    }

    setErrors(newErrors);
    
    if (missing.length > 0) {
      setMissingFields(missing);
      setShowValidationAlert(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowValidationAlert(false);
      }, 5000);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Just add the sale - the backend will handle stock deduction
        onAddSale({
          ...formData,
          quantity: Number(formData.quantity),
          price: Number(formData.price)
        });

        // Trigger inventory refresh
        if (onInventoryUpdate) {
          onInventoryUpdate();
        }

        handleClose();
      } catch (err) {
        console.error('Error processing sale:', err);
        
        // Refresh inventory data in case it's stale
        await fetchInventoryProducts();
        
        // Update selected product with latest data
        if (selectedProduct) {
          const updatedProduct = inventoryProducts.find(p => p.id === selectedProduct.id);
          if (updatedProduct) {
            setSelectedProduct(updatedProduct);
            // Update the form with current stock info
            setFormData(prev => ({
              ...prev,
              price: updatedProduct.productPrice.toString()
            }));
          }
        }
        
        throw err;
      }
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)'
          }}
        />

        <div 
          ref={modalRef}
          className={`bg-gray-100 shadow-md rounded-md p-6 w-[460px] max-h-[750px] relative z-10 ${
            isClosing ? 'animate-modal-out' : 'animate-modal-in'
          }`}
        >
          <div>
            <h3 className="text-[20px] font-bold">Add Sales</h3>
            <p className="text-[12px]">Record a new product sales with quantity and price.</p>
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Details Section */}
              <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4">
                <h3 className="text-[16px] font-bold">Details</h3>
                
                {/* Product Name Dropdown */}
                <div className="mt-2">
                  <label className="text-[12px] font-bold">
                    Product Name
                  </label>
                  <div className="relative" ref={productDropdownRef}>
                    <input
                      type="text"
                      value={productSearchTerm}
                      onChange={(e) => {
                        setProductSearchTerm(e.target.value);
                        setIsProductDropdownOpen(true);
                      }}
                      onFocus={() => setIsProductDropdownOpen(true)}
                      placeholder="Search and select product"
                      className={`w-full border rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none ${
                        showValidationAlert && errors.productName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    
                    {/* Product Dropdown */}
                    {isProductDropdownOpen && (
                      <div
                        className="dropdown-options mt-1 rounded-md [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        style={{
                          display: isProductDropdownOpen ? 'block' : 'none',
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
                          maxHeight: '180px',
                          overflowY: 'auto'
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            setIsProductDropdownOpen(false);
                          }
                        }}
                        tabIndex={isProductDropdownOpen ? 0 : -1}
                      >
                        {isLoadingProducts ? (
                          <div className="px-4 py-4 text-center text-gray-500">
                            Loading products...
                          </div>
                        ) : filteredProducts.length === 0 ? (
                          <div className="px-4 py-4 text-center text-gray-500">
                            No products found
                          </div>
                        ) : (
                          filteredProducts.map((product) => (
                            <div
                              key={product.id}
                              className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                selectedProduct?.id === product.id ? 'bg-blue-50 text-blue-600' : ''
                              }`}
                              onClick={() => handleProductSelect(product)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleProductSelect(product);
                                }
                              }}
                              tabIndex={isProductDropdownOpen ? 0 : -1}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{product.productName}</div>
                                  <div className="text-xs text-gray-500">
                                  Stock: {product.stock} | Price: ₱{product.productPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {selectedProduct && (
                    <p className="text-green-600 text-xs mt-1">
                      Available stock: {selectedProduct.stock} units
                    </p>
                  )}
                </div>

                {/* Quantity and Price Row */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="text-[12px] font-bold">
                      Quantity 
                    </label>
                    <input
                      type="text"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                        const formatted = formatNumberWithCommas(numericValue);
                        handleInputChange('quantity', formatted === '' ? '' : formatted);
                      }}
                      placeholder="0"
                      className={`w-full border rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none ${
                        showValidationAlert && errors.quantity ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-bold">
                      Price per Item (₱)
                    </label>
                    <input
                      type="text"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      readOnly={true}
                      placeholder="0.00"
                      className={`w-full border rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none cursor-not-allowed ${
                        showValidationAlert && errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                {/* Total Amount Display */}
                {formData.quantity && formData.price && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] font-bold text-gray-700">Total Amount:</span>
                      <span className="text-[16px] font-bold text-green-600">
                        ₱{(Number(formData.quantity) * Number(formData.price)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="mt-2">
                  <label className="text-[12px] font-bold">Payment Method</label>
                  <div className="relative" ref={paymentMethodRef}>
                    <div
                      onClick={() => setIsPaymentMethodOpen(!isPaymentMethodOpen)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setIsPaymentMethodOpen(!isPaymentMethodOpen);
                          e.preventDefault();
                        }
                      }}
                      tabIndex={0}
                      className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-md px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[29px]"
                    >
                      <span>{formData.paymentMethod}</span>
                      <svg 
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className={`transition-transform ${isPaymentMethodOpen ? 'rotate-180' : ''}`}
                      >
                        <polygon points="4,6 12,6 8,12" fill="currentColor" />
                      </svg>
                    </div>
                    
                    {/* Dropdown Menu */}
                    <div
                      className="dropdown-options mt-1 rounded-md [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                      style={{
                        display: isPaymentMethodOpen ? 'block' : 'none',
                        position: 'absolute',
                        top: '-550%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        zIndex: 10,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box'
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setFocusedPaymentOption((prev) => (prev + 1) % paymentMethodOptions.length);
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setFocusedPaymentOption((prev) => (prev - 1 + paymentMethodOptions.length) % paymentMethodOptions.length);
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          handleInputChange('paymentMethod', paymentMethodOptions[focusedPaymentOption]);
                          setIsPaymentMethodOpen(false);
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          setIsPaymentMethodOpen(false);
                        }
                      }}
                      tabIndex={isPaymentMethodOpen ? 0 : -1}
                    >
                      {paymentMethodOptions.map((method, idx) => (
                        <div
                          key={method}
                          className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                            formData.paymentMethod === method ? 'bg-blue-50 text-blue-600' : ''
                          } ${focusedPaymentOption === idx ? '' : ''}`}
                          onClick={() => {
                            handleInputChange('paymentMethod', method);
                            setIsPaymentMethodOpen(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleInputChange('paymentMethod', method);
                              setIsPaymentMethodOpen(false);
                            }
                          }}
                          tabIndex={isPaymentMethodOpen ? 0 : -1}
                        >
                          {method}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sale Date */}
                <div className="mt-2">
                  <label className="text-[12px] font-bold">Sale Date</label>
                  <CustomDatePicker
                    selected={formData.date ? parseDateFromMMDDYYYY(formData.date) : null}
                    onChange={(date: Date | null) => handleInputChange('date', date ? formatDateToMMDDYYYY(date) : '')}
                    className={errors.date ? 'border-red-300' : ''}
                  />
                </div>
              </div>
            </form>
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
              onClick={handleSubmit}
              className="bg-[#02367B] text-white rounded-md px-3 py-1 hover:bg-[#1C4A9E] border border-gray-300"
            >
              Add Sales
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default AddSalesModal;
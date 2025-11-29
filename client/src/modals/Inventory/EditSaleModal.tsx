import React, { useState, useEffect, useRef, useCallback } from 'react';
import CustomDatePicker from '../../components/common/CustomDatePicker';
import Portal from '../../components/common/Portal';
import axios from 'axios';

export type SalesRecord = {
  id: number;
  date: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay';
};

interface InventoryProduct {
  id: number;
  productName: string;
  stock: number;
  productPrice: number;
  category: string;
}

interface EditSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SalesRecord | null;
  onSave: (updatedSale: SalesRecord) => void;
  isUpdating?: boolean;
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

const EditSaleModal: React.FC<EditSaleModalProps> = ({ isOpen, onClose, sale, onSave, isUpdating = false }) => {
  const [formData, setFormData] = useState<{
    date: string;
    productName: string;
    quantity: number | string;
    price: number | string;
    paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay';
  }>({
    date: sale?.date || '',
    productName: sale?.productName || '',
    quantity: sale?.quantity || '',
    price: sale?.price || '',
    paymentMethod: sale?.paymentMethod || 'Cash'
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [focusedPaymentOption, setFocusedPaymentOption] = useState(0);
  const paymentDropdownRef = useRef<HTMLDivElement>(null);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [inventoryProducts, setInventoryProducts] = useState<InventoryProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<{ productName?: string }>({});
  const [isClosing, setIsClosing] = useState(false);
  const [wasUpdating, setWasUpdating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sale) {
      setFormData({
        date: sale.date,
        productName: sale.productName,
        quantity: sale.quantity,
        price: sale.price,
        paymentMethod: sale.paymentMethod
      });
      
      // Convert date string to Date object
      if (sale.date) {
        setSelectedDate(parseDateFromMMDDYYYY(sale.date));
      }
    }
  }, [sale]);

  // Fetch inventory products when modal opens - FIXED ESLINT WARNING
  const fetchInventoryProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const response = await axios.get('http://localhost:3001/api/inventory');
      setInventoryProducts(response.data);
      
      // Set selected product if editing existing sale
      if (sale?.productName) {
        const product = response.data.find((p: InventoryProduct) => p.productName === sale.productName);
        if (product) {
          setSelectedProduct(product);
          setProductSearchTerm(sale.productName);
        }
      }
    } catch (err) {
      console.error('Error fetching inventory products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [sale]);

  useEffect(() => {
    if (isOpen) {
      fetchInventoryProducts();
    }
  }, [isOpen, fetchInventoryProducts]); // Added fetchInventoryProducts to dependency array

  // Filter products based on search term
  const filteredProducts = inventoryProducts.filter(product =>
    product.productName.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const handleProductSelect = (product: InventoryProduct) => {
    setSelectedProduct(product);
    setFormData(prev => ({
      ...prev,
      productName: product.productName,
      price: product.productPrice,
    }));
    setProductSearchTerm(product.productName);
    setIsProductDropdownOpen(false);
    
    // Clear error when product is selected
    if (errors.productName) {
      setErrors(prev => ({
        ...prev,
        productName: undefined
      }));
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setIsProductDropdownOpen(false);
      }
      // Close modal when clicking outside (on the backdrop)
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && !isUpdating) {
        onClose();
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'quantity' || name === 'price') {
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

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = formatDateToMMDDYYYY(date);
      setFormData(prev => ({
        ...prev,
        date: formattedDate
      }));
    }
  };

  const togglePaymentDropdown = () => {
    if (!isUpdating) {
      setIsSelectOpen(!isSelectOpen);
    }
  };

  const handlePaymentSelect = (method: 'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay') => {
    if (!isUpdating) {
      setFormData(prev => ({ ...prev, paymentMethod: method }));
      setIsSelectOpen(false);
    }
  };

  const validateForm = () => {
    const newErrors: { productName?: string } = {};

    // Check if product name matches an inventory product
    const productExists = inventoryProducts.some(
      product => product.productName.toLowerCase() === formData.productName.trim().toLowerCase()
    );

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    } else if (!productExists) {
      newErrors.productName = 'Product does not exist in inventory. Please select from the list.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!sale || isUpdating) return;
    
    if (!validateForm()) {
      return;
    }
    
    const updatedSale: SalesRecord = {
      ...sale,
      ...formData,
      quantity: Number(formData.quantity) || 0,
      price: Number(formData.price) || 0,
      total: (Number(formData.quantity) || 0) * (Number(formData.price) || 0)
    };
    onSave(updatedSale);
  };

  // Animation close handler
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const totalAmount = (Number(formData.quantity) || 0) * (Number(formData.price) || 0);

  if (!isOpen && !isClosing) return null;

  const paymentMethods: Array<'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay'> = ['Cash', 'Gcash', 'PayMaya', 'Juanpay'];

  return (
    <Portal>
        {/* Backdrop with animation */}
        <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`} style={{
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)'
        }} />
        
        {/* Modal with animation */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            ref={modalRef}
            className={`bg-gray-100 shadow-md rounded-md p-6 w-[460px] max-h-[750px] ${
              isClosing ? 'animate-modal-out' : 'animate-modal-in'
            }`}
          >
            <div>
              <h3 className="text-[20px] font-bold">Edit Sales</h3>
              <p className="text-[12px]">Update sale record details</p>
            </div>
            
            <div className="overflow-y-auto max-h-[550px] mt-4 text-[12px]">
              <div className="flex flex-col gap-3">
                {/* Product Details Section */}
                <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4">
                  <h3 className="text-[16px] font-bold">Details</h3>
                  
                  {/* Product Name Dropdown */}
                  <div className="mt-2">
                    <label className="text-[12px] font-bold">Product Name</label>
                    <div className="relative" ref={productDropdownRef}>
                      <input
                        type="text"
                        value={productSearchTerm}
                        onChange={(e) => {
                          setProductSearchTerm(e.target.value);
                          setIsProductDropdownOpen(true);
                          setFormData(prev => ({
                            ...prev,
                            productName: e.target.value
                          }));
                          // Clear error when user starts typing
                          if (errors.productName) {
                            setErrors(prev => ({
                              ...prev,
                              productName: undefined
                            }));
                          }
                        }}
                        onFocus={() => setIsProductDropdownOpen(true)}
                        disabled={isUpdating}
                        placeholder="Search and select product"
                        className={`w-full border rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                          errors.productName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      
                      {/* Product Dropdown */}
                      {isProductDropdownOpen && !isUpdating && (
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
                            if (e.key === 'Escape') {
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
                    {errors.productName && (
                      <p className="text-red-500 text-xs mt-1">{errors.productName}</p>
                    )}
                    {selectedProduct && (
                      <p className="text-green-600 text-xs mt-1">
                        Available stock: {selectedProduct.stock} units
                      </p>
                    )}
                  </div>

                  {/* Quantity and Price Row */}
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="text-[12px] font-bold">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        disabled={isUpdating}
                        min="1"
                        placeholder="0"
                        className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold">Price per Item (₱)</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        disabled={isUpdating}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Total Amount Display */}
                  <div className="bg-blue-50 rounded-md p-3 mt-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[12px] font-bold text-gray-700">Total Amount:</p>
                        <p className="text-[10px] text-gray-500">
                        {formData.quantity || 0} x ₱{(Number(formData.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      </div>
                    <div className="text-[16px] font-bold text-green-600">
                      ₱{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mt-2">
                    <label className="text-[12px] font-bold">Payment Method</label>
                    <div className="relative" ref={paymentDropdownRef}>
                      <div
                        onClick={togglePaymentDropdown}
                        onKeyDown={(e) => {
                          if (!isUpdating && (e.key === 'Enter' || e.key === ' ')) {
                            togglePaymentDropdown();
                            e.preventDefault();
                          }
                        }}
                        tabIndex={isUpdating ? -1 : 0}
                        className={`dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-md px-4 text-gray-600 cursor-pointer h-[29px] ${
                          isUpdating 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-gray-200'
                        }`}
                      >
                        {formData.paymentMethod}
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
                            setFocusedPaymentOption((prev) => (prev + 1) % paymentMethods.length);
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setFocusedPaymentOption((prev) => (prev - 1 + paymentMethods.length) % paymentMethods.length);
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            handlePaymentSelect(paymentMethods[focusedPaymentOption]);
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            setIsSelectOpen(false);
                          }
                        }}
                        tabIndex={isSelectOpen && !isUpdating ? 0 : -1}
                      >
                        {paymentMethods.map((method, idx) => (
                          <div
                            key={method}
                            onClick={() => handlePaymentSelect(method)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handlePaymentSelect(method);
                              }
                            }}
                            tabIndex={isSelectOpen && !isUpdating ? 0 : -1}
                            className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer  ${
                            formData.paymentMethod === method ? 'bg-blue-50 text-blue-600' : ''}${
                              focusedPaymentOption === idx ? '' : ''
                            }`}
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
                      selected={selectedDate}
                      onChange={handleDateChange}
                      maxDate={new Date()}
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex justify-end gap-2 mt-4 text-[12px] font-bold">
              <button
                type="button"
                onClick={handleClose}
                disabled={isUpdating}
                className="border border-gray-300 hover:bg-gray-200 rounded-md px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isUpdating}
                className="bg-[#02367B] text-white rounded-md px-3 py-1 hover:bg-[#1C4A9E] border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  'Update Sales'
                )}
              </button>
            </div>
          </div>
        </div>
    </Portal>
  );
};

export default EditSaleModal;
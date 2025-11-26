import React, { useState, useRef, useEffect } from 'react';
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
  const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [inventoryProducts, setInventoryProducts] = useState<InventoryProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [focusedPaymentOption, setFocusedPaymentOption] = useState(0);
  
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  const paymentMethodOptions = ['Cash', 'Gcash', 'PayMaya', 'Juanpay'];

  // Fetch inventory products when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInventoryProducts();
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

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paymentMethodRef.current && !paymentMethodRef.current.contains(event.target as Node)) {
        setIsPaymentMethodOpen(false);
      }
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setIsProductDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        productName: ''
      }));
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

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    const quantity = Number(formData.quantity);
    if (!formData.quantity || quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    // Check if quantity exceeds available stock
    if (selectedProduct && quantity > selectedProduct.stock) {
      newErrors.quantity = `Only ${selectedProduct.stock} items available in stock`;
    }

    const price = Number(formData.price);
    if (!formData.price || price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Sale date is required';
    }

    setErrors(newErrors);
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
              price: updatedProduct.productPrice
            }));
          }
        }
        
        // The error will be handled by the parent component
        throw err; // Re-throw to let parent handle the error
      }
    }
  };

  const handleClose = () => {
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-100 shadow-md rounded-md p-6 w-[460px] max-h-[750px]">
          <div>
            <h3 className="text-[20px] font-bold">Add Sales</h3>
            <p className="text-[12px]">Record a new product sales with quantity and price.</p>
          </div>
          
          <div className="overflow-y-auto max-h-[550px] mt-4 text-[12px]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Details Section */}
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
                      }}
                      onFocus={() => setIsProductDropdownOpen(true)}
                      placeholder="Search and select product"
                      className={`w-full border rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none ${
                        errors.productName ? 'border-red-300' : 'border-gray-300'
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
                          maxHeight: '100px',
                          overflowY: 'auto'
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            // Add keyboard navigation logic if needed
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            // Add keyboard navigation logic if needed
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
                                    Stock: {product.stock} | Price: ₱{product.productPrice.toFixed(2)}
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
                      min="1"
                      max={selectedProduct?.stock || undefined}
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="0"
                      className={`w-full border rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        errors.quantity ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.quantity && (
                      <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[12px] font-bold">Price per Item (₱)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="0.00"
                      className={`w-full border rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        errors.price ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.price && (
                      <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                    )}
                  </div>
                </div>

                {/* Total Amount Display */}
                {formData.quantity && formData.price && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] font-bold text-gray-700">Total Amount:</span>
                      <span className="text-[16px] font-bold text-blue-600">
                        ₱{(Number(formData.quantity) * Number(formData.price)).toFixed(2)}
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
                          } ${focusedPaymentOption === idx ? 'bg-blue-100' : ''}`}
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
                  {errors.date && (
                    <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                  )}
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
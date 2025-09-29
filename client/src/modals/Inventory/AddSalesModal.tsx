import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import CustomDatePicker from '../../components/common/CustomDatePicker';

interface AddSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSale: (saleData: {
    productName: string;
    quantity: number;
    price: number;
    paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Card';
    date: string;
  }) => void;
}

const AddSalesModal: React.FC<AddSalesModalProps> = ({
  isOpen,
  onClose,
  onAddSale,
}) => {
  const [formData, setFormData] = useState({
    productName: '',
    quantity: 0,
    price: 0,
    paymentMethod: 'Cash' as 'Cash' | 'Gcash' | 'PayMaya' | 'Card',
    date: new Date().toISOString().split('T')[0], // Today's date as default
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false);
  const paymentMethodRef = useRef<HTMLDivElement>(null);

  const paymentMethodOptions = ['Cash', 'Gcash', 'PayMaya', 'Card'];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paymentMethodRef.current && !paymentMethodRef.current.contains(event.target as Node)) {
        setIsPaymentMethodOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
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

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Sale date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddSale(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      productName: '',
      quantity: 0,
      price: 0,
      paymentMethod: 'Cash',
      date: new Date().toISOString().split('T')[0],
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Sales</h2>
            <p className="text-gray-500 text-sm mt-1">
              Record a new product sales with quantity and price.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02367B] focus:ring-offset-1 rounded-md p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Details Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Details</h3>
              
              {/* Product Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  placeholder="Enter Product Name"
                  className={`w-full px-3 py-2 bg-gray-100 border rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white transition-all outline-none ${
                    errors.productName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.productName && (
                  <p className="text-red-500 text-xs mt-1">{errors.productName}</p>
                )}
              </div>

              {/* Quantity and Price Row */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity || ''}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className={`w-full px-3 py-2 bg-gray-100 border rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white transition-all outline-none ${
                      errors.quantity ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Item (₱)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="₱0.00"
                    className={`w-full px-3 py-2 bg-gray-100 border rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white transition-all outline-none ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <div className="relative" ref={paymentMethodRef}>
                  <div
                    onClick={() => setIsPaymentMethodOpen(!isPaymentMethodOpen)}
                    className="w-full px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white transition-all outline-none cursor-pointer flex items-center justify-between text-sm"
                  >
                    <span>{formData.paymentMethod}</span>
                    <svg 
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className={`text-gray-500 transition-transform duration-200 ease-in-out flex-shrink-0 ml-2 ${
                        isPaymentMethodOpen ? 'rotate-180' : ''
                      }`}
                    >
                      <polygon points="4,6 12,6 8,12" fill="currentColor" />
                    </svg>
                  </div>
                  
                  {/* Dropdown Menu */}
                  {isPaymentMethodOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                      {paymentMethodOptions.map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            handleInputChange('paymentMethod', method);
                            setIsPaymentMethodOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                            formData.paymentMethod === method ? 'bg-blue-50 text-blue-600' : ''
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sale Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Date
                </label>
                <CustomDatePicker
                  selected={formData.date ? new Date(formData.date) : null}
                  onChange={(date: Date | null) => handleInputChange('date', date ? date.toISOString().split('T')[0] : '')}
                  className={errors.date ? 'border-red-300' : ''}
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-1.5 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#02367B] text-white rounded-md hover:bg-[#02367B]/90 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#02367B] focus:ring-offset-1"
              >
                Add Sales
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSalesModal;
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import CustomDatePicker from '../../components/common/CustomDatePicker';

// Fixed: 'Paymaya' → 'PayMaya'
export type SalesRecord = {
  id: number;
  date: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay';
};

interface EditSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SalesRecord | null;
  onSave: (updatedSale: SalesRecord) => void;
  isUpdating?: boolean;
}

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
  const paymentDropdownRef = useRef<HTMLDivElement>(null);

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
        setSelectedDate(new Date(sale.date));
      }
    }
  }, [sale]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(event.target as Node)) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'quantity' || name === 'price') {
      // Allow empty string or convert to number
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

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
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

  const handleSubmit = () => {
    if (!sale || isUpdating) return;
    
    const updatedSale: SalesRecord = {
      ...sale,
      ...formData,
      quantity: Number(formData.quantity) || 0,
      price: Number(formData.price) || 0,
      total: (Number(formData.quantity) || 0) * (Number(formData.price) || 0)
    };
    onSave(updatedSale);
  };

  const totalAmount = (Number(formData.quantity) || 0) * (Number(formData.price) || 0);

  if (!isOpen) return null;

  const paymentMethods: Array<'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay'> = ['Cash', 'Gcash', 'PayMaya', 'Juanpay'];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Sales</h2>
            <p className="text-gray-500 text-sm mt-1">Update sale record details</p>
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
              <h3 className="text-sm font-medium text-gray-900 mb-4">Details</h3>
              
              {/* Product Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  disabled={isUpdating}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              {/* Quantity and Price Row */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    disabled={isUpdating}
                    min="1"
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Item (₱)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    disabled={isUpdating}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>
              </div>
              
              {/* Total Amount Display */}
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600">Total Amount:</p>
                    <p className="text-sm text-gray-500">
                      {formData.quantity || 0} x ₱{(Number(formData.price) || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-md font-semibold text-green-600">
                    ₱{totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <div className="relative" ref={paymentDropdownRef}>
                  <div
                    onClick={togglePaymentDropdown}
                    className={`w-full px-3 py-2 pr-8 bg-gray-100 border border-gray-300 rounded-lg text-left transition-all outline-none ${
                      isUpdating 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'cursor-pointer hover:bg-gray-200'
                    } ${
                      isSelectOpen ? 'ring-2 ring-[#02367B] border-[#02367B] bg-white' : 'focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white'
                    }`}
                  >
                    {formData.paymentMethod}
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
                        Select Payment Method
                      </div>
                      
                      {paymentMethods.map((method) => (
                        <div
                          key={method}
                          onClick={() => handlePaymentSelect(method)}
                          className="px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-200 last:border-b-0 flex items-center transition-colors cursor-pointer"
                        >
                          {method}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sale Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Date
                </label>
                <CustomDatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  maxDate={new Date()}
                  disabled={isUpdating}
                />
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
                  'Update Sales'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSaleModal;
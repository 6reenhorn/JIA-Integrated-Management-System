import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

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
}

const EditSaleModal: React.FC<EditSaleModalProps> = ({ isOpen, onClose, sale, onSave }) => {
  const [formData, setFormData] = useState({
    date: sale?.date || '',
    productName: sale?.productName || '',
    quantity: sale?.quantity || 0,
    price: sale?.price || 0,
    paymentMethod: sale?.paymentMethod || 'Cash'
  });

  React.useEffect(() => {
    if (sale) {
      setFormData({
        date: sale.date,
        productName: sale.productName,
        quantity: sale.quantity,
        price: sale.price,
        paymentMethod: sale.paymentMethod
      });
    }
  }, [sale]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sale) return;
    
    const updatedSale: SalesRecord = {
      ...sale,
      ...formData,
      total: formData.quantity * formData.price
    };
    onSave(updatedSale);
  };

  const totalAmount = formData.quantity * formData.price;

  if (!isOpen) return null;

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
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02367B] focus:ring-offset-1 rounded-md p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
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
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white transition-all outline-none"
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
                      min="1"
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white transition-all outline-none"
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
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Total Amount Display */}
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-600">Total Amount:</p>
                      <p className="text-sm text-gray-500">{formData.quantity} x ₱{formData.price.toFixed(2)}</p>
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
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white transition-all outline-none"
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Gcash">Gcash</option>
                    <option value="PayMaya">PayMaya</option>
                    <option value="Juanpay">Juanpay</option> {/* Fixed: Added Juanpay, removed Card */}
                  </select>
                </div>

                {/* Sale Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sale Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:bg-white transition-all outline-none pr-10"
                      required
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#02367B] text-white rounded-md hover:bg-[#02367B] transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#02367B]focus:ring-offset-1"
                >
                  Update Sales
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSaleModal;
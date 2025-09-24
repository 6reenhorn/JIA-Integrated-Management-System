// EditProductModal.tsx
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { InventoryItem } from '../../types/inventory_types'; // <-- update path if needed

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: InventoryItem) => void;
  initialData?: InventoryItem;
  categories: string[];
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories
}) => {
  const [formData, setFormData] = useState<InventoryItem>({
    id: 0,
    productName: '',
    category: '',
    storageLocation: '',
    status: 'Good',
    productPrice: 0,
    quantity: 0
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [minimumStock, setMinimumStock] = useState(0);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData(initialData);
      setDescription('This is a description');
      setMinimumStock(5); // Default minimum stock
    }
  }, [initialData, isOpen]);

  const handleInputChange = (field: keyof InventoryItem, value: string | number) => {
    setFormData((prev: InventoryItem) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Update status based on quantity and minimum stock
    const updatedFormData = {
      ...formData,
      status: formData.quantity === 0 ? 'Out Of Stock' : 
              formData.quantity <= minimumStock ? 'Low Stock' : 'Good'
    };
    
    onSave(updatedFormData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="p-6 pb-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Edit Product</h2>
          <p className="text-gray-500 text-sm mb-6">Update the product information and inventory details.</p>
        </div>

        {/* Form Content */}
        <div className="px-6">
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Product Details</h3>
            
            {/* Product Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                className="w-full px-4 py-3 bg-gray-300 border-0 rounded-lg text-gray-900 focus:outline-none focus:ring-0"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-300 border-0 rounded-lg text-gray-900 focus:outline-none focus:ring-0 resize-none"
              />
            </div>

            {/* Category and Price Row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-3 bg-gray-300 border-0 rounded-lg text-left text-gray-900 focus:outline-none flex items-center justify-between"
                  >
                    <span>{formData.category}</span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            handleInputChange('category', category);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-900"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₱)
                </label>
                <input
                  type="text"
                  value={`₱${formData.productPrice.toFixed(2)}`}
                  onChange={(e) => {
                    const value = e.target.value.replace('₱', '');
                    handleInputChange('productPrice', parseFloat(value) || 0);
                  }}
                  className="w-full px-4 py-3 bg-gray-300 border-0 rounded-lg text-gray-900 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* Current Stock and Minimum Stock Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Current Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Stock
                </label>
                <input
                  type="text"
                  value={`${formData.quantity} Units`}
                  onChange={(e) => {
                    const value = e.target.value.replace(' Units', '');
                    handleInputChange('quantity', parseInt(value) || 0);
                  }}
                  className="w-full px-4 py-3 bg-gray-300 border-0 rounded-lg text-gray-900 focus:outline-none focus:ring-0"
                />
              </div>

              {/* Minimum Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={minimumStock}
                  onChange={(e) => setMinimumStock(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-gray-300 border-0 rounded-lg text-gray-900 focus:outline-none focus:ring-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 p-6">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium"
          >
            Update Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
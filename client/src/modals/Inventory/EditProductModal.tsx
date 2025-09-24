// EditProductModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { InventoryItem } from '../../types/inventory_types';

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
    stock: 0,
    status: 'Good',
    productPrice: 0,
    totalAmount: 0
  });

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [description, setDescription] = useState('');
  const [minimumStock, setMinimumStock] = useState(0);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Category colors mapping
  const categoryColors = [
    '#3B82F6', // blue
    '#EF4444', // red  
    '#10B981', // green
    '#F59E0B', // orange
    '#EC4899', // pink
    '#8B5CF6', // purple
    '#06B6D4', // cyan
    '#84CC16'  // lime
  ];

  const getCategoryColor = (index: number) => {
    return categoryColors[index % categoryColors.length];
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
        setShowAddCategory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData(initialData);
      setDescription('This is a description');
      setMinimumStock(5);
    }
  }, [initialData, isOpen]);

  const toggleCategoryDropdown = () => {
    setIsSelectOpen(!isSelectOpen);
    setShowAddCategory(false);
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setFormData(prev => ({ ...prev, category: newCategory.trim() }));
      setNewCategory('');
      setShowAddCategory(false);
      setIsSelectOpen(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
    setIsSelectOpen(false);
  };

  const handleInputChange = (field: keyof InventoryItem, value: string | number) => {
    setFormData((prev: InventoryItem) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    const updatedFormData = {
      ...formData,
      status: formData.totalAmount === 0 ? 'Out Of Stock' : 
              formData.totalAmount <= minimumStock ? 'Low Stock' : 'Good'
    };
    
    onSave(updatedFormData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Product</h2>
            <p className="text-gray-500 text-sm mt-1">Update the product information and inventory details.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="px-6 pb-6">
          <div className="space-y-6">
            {/* Product Details Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Product Details</h3>
              
              {/* Product Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all resize-none outline-none"
                />
              </div>

              {/* Category and Price Row */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <div className="relative" ref={categoryDropdownRef}>
                    <div
                      onClick={toggleCategoryDropdown}
                      className={`w-full px-3 py-2 pr-8 bg-gray-100 border border-gray-300 rounded-lg text-left cursor-pointer hover:bg-gray-200 transition-all outline-none ${
                        isSelectOpen ? 'ring-2 ring-blue-500 border-blue-500 bg-white' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white'
                      }`}
                    >
                      <div className="flex items-center">
                        {formData.category ? (
                          <>
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: getCategoryColor(categories.indexOf(formData.category)) }}
                            ></div>
                            {formData.category}
                          </>
                        ) : (
                          <span className="text-gray-500">Select Category</span>
                        )}
                      </div>
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

                    <div
                      className="dropdown-options absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-48 overflow-y-auto"
                      style={{
                        display: isSelectOpen ? 'block' : 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    >
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 font-medium text-gray-700 text-center text-sm">
                        Select Category +
                      </div>
                      
                      {categories.map((category, index) => (
                        <div
                          key={category}
                          onClick={() => handleCategorySelect(category)}
                          className="px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center transition-colors cursor-pointer"
                        >
                          <div 
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: getCategoryColor(index) }}
                          ></div>
                          {category}
                        </div>
                      ))}
                      
                      <div
                        onClick={() => setShowAddCategory(true)}
                        className="px-4 py-2 text-left hover:bg-blue-50 text-blue-600 border-t border-gray-200 cursor-pointer transition-colors"
                      >
                        + Add New Category
                      </div>
                    </div>
                  </div>

                  {showAddCategory && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter new category name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none mb-2"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddCategory(false);
                            setNewCategory('');
                          }}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₱)
                  </label>
                  <input
                    type="number"
                    value={formData.productPrice || ''}
                    onChange={(e) => handleInputChange('productPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              {/* Current Stock and Minimum Stock Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Current Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    value={formData.totalAmount || ''}
                    onChange={(e) => handleInputChange('totalAmount', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                {/* Minimum Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minimumStock}
                    onChange={(e) => setMinimumStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Update Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
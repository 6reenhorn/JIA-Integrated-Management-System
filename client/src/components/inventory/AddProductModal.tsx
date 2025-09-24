import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { ProductFormData } from '../../types/inventory_types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (productData: ProductFormData) => void;
  categories: string[];
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  categories
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    productName: '',
    category: '',
    productPrice: 0,
    quantity: 0,
    minimumStock: 0
  });

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine status based on quantity
    let status = 'Good';
    if (formData.quantity === 0) {
      status = 'Out Of Stock';
    } else if (formData.quantity <= (formData.minimumStock || 5)) {
      status = 'Low Stock';
    }

    const productData = {
      ...formData,
      status
    };

    onAddProduct(productData);
    
    // Reset form
    setFormData({
      productName: '',
      category: '',
      productPrice: 0,
      quantity: 0,
      minimumStock: 0
    });
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'productPrice' || name === 'quantity' || name === 'minimumStock' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add New Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {/* Product Details Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Product Details</h3>
            
            {/* Product Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="Enter product description"
                rows={3}
                className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Category and Price */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="relative">
                  {/* Custom Dropdown Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                    className="w-full px-3 py-2 pr-8 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-left"
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
                  </button>
                  
                  {/* Dropdown Arrow with Animation */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg 
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ease-in-out ${
                        isSelectOpen ? 'transform rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Custom Dropdown Menu */}
                  {isSelectOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-48 overflow-y-auto">
                      {/* Select Category + header */}
                      <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 font-medium text-gray-700 text-center">
                        Select Category +
                      </div>
                      
                      {/* Category Options */}
                      {categories.map((category, index) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleCategorySelect(category)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center transition-colors"
                        >
                          <div 
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: getCategoryColor(index) }}
                          ></div>
                          {category}
                        </button>
                      ))}
                      
                    </div>
                  )}
                </div>

                {/* Add Category Input */}
                {showAddCategory && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter new category name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddCategory(false);
                          setNewCategory('');
                        }}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₱)
                </label>
                <input
                  type="number"
                  name="productPrice"
                  value={formData.productPrice || ''}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Current Stock and Minimum Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Stock
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity || ''}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Stock
                </label>
                <input
                  type="number"
                  name="minimumStock"
                  value={formData.minimumStock || ''}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
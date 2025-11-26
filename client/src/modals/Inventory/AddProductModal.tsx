import React, { useState, useRef, useEffect } from 'react';
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
  }>({
    productName: '',
    category: '',
    productPrice: '',
    quantity: '',
    minimumStock: '',
    description: ''
  });

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
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
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'productPrice' || name === 'quantity' || name === 'minimumStock') {
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
          
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[550px] mt-4 text-[12px] flex flex-col gap-3">
            {/* Product Details Section */}
            <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4">
              <h3 className="text-[16px] font-bold">Product Details</h3>
              
              <div className="mt-2">
                <label className="text-[12px] font-bold">Product Name</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none"
                  required
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
                  <div
                    className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-md px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[29px]"
                    onClick={toggleCategoryDropdown}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        toggleCategoryDropdown();
                        e.preventDefault();
                      }
                    }}
                    tabIndex={0}
                  >
                    <div className="flex items-center">
                      {formData.category ? (
                        <>
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: categoryColors[formData.category] || '#6B7280' }}
                          ></div>
                          {formData.category}
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
                      className={`transition-transform ${isSelectOpen ? 'rotate-180' : ''}`}
                    >
                      <polygon points="4,6 12,6 8,12" fill="currentColor" />
                    </svg>
                  </div>
                  
                  {/* KEEPING YOUR EXACT DROPDOWN STYLING */}
                  <div
                    className="dropdown-options mt-1 rounded-md [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    style={{
                      display: isSelectOpen ? 'block' : 'none',
                      position: 'absolute',
                      top: '-330%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      zIndex: 10,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      maxHeight: '170px',
                      overflowY: 'auto'
                    }}
                  >
                    {categories.map((category) => (
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
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: categoryColors[category] || '#6B7280' }}
                        ></div>
                        {category}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-bold">Price (₱)</label>
                  <input
                    type="number"
                    name="productPrice"
                    value={formData.productPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="text-[12px] font-bold">Current Stock</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
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
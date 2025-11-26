import React, { useState, useEffect, useRef, useCallback } from 'react';
import Portal from '../../components/common/Portal';

interface Category {
  name: string;
  productCount: number;
  totalStock: number;
  totalValue: number;
  color?: string;
}

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (oldName: string, newName: string, color: string) => void;
  initialData?: Category;
  isUpdating?: boolean;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isUpdating = false
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#3B82F6');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const defaultColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6',
    '#06B6D4', '#F97316', '#14B8A6', '#A855F7', '#84CC16', '#F43F5E'
  ];

  const handleCancel = useCallback(() => {
    if (isUpdating) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  }, [isUpdating, onClose]);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
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
        if (showColorPicker) {
          setShowColorPicker(false);
        } else {
          handleCancel();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isUpdating, showColorPicker, handleCancel]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        if (!isUpdating) {
          handleCancel();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUpdating, handleCancel]);

  useEffect(() => {
    if (initialData && isOpen) {
      setCategoryName(initialData.name);
      setCategoryColor(initialData.color || '#3B82F6');
    }
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    if (isUpdating || !categoryName.trim()) return;
    
    if (initialData) {
      onSave(initialData.name, categoryName.trim(), categoryColor);
    }
  };

  const handleColorSelect = (color: string) => {
    setCategoryColor(color);
    setShowColorPicker(false);
  };

  const toggleColorPicker = () => {
    if (!isUpdating) {
      setShowColorPicker(!showColorPicker);
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
          {/* Header */}
          <div>
            <h3 className="text-[20px] font-bold">Edit Category</h3>
            <p className="text-[12px]">Update the category name and color</p>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[550px] mt-4 text-[12px]">
            <div className="flex flex-col gap-3">
              {/* Category Details Section */}
              <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4">
                <h3 className="text-[16px] font-bold">Category Details</h3>
                
                {/* Category Name Input */}
                <div className="mt-2">
                  <label className="text-[12px] font-bold">Category Name</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    disabled={isUpdating}
                    placeholder="Enter category name"
                    autoFocus
                    className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  />
                </div>

                {/* Category Color Picker */}
                <div className="mt-2 relative" ref={colorPickerRef}>
                  <label className="text-[12px] font-bold">Category Color</label>
                  <div
                    className={`relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-md px-4 text-gray-600 cursor-pointer h-[29px] transition-all duration-200 ${
                      isUpdating 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-200'
                    }`}
                    onClick={toggleColorPicker}
                    onKeyDown={(e) => {
                      if (!isUpdating && (e.key === 'Enter' || e.key === ' ')) {
                        toggleColorPicker();
                        e.preventDefault();
                      }
                    }}
                    tabIndex={isUpdating ? -1 : 0}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border border-gray-300 flex-shrink-0 transition-colors duration-200"
                        style={{ backgroundColor: categoryColor }}
                      />
                      <span className="text-[12px] font-mono">{categoryColor.toUpperCase()}</span>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className={`transition-transform duration-200 ${showColorPicker ? 'rotate-180' : ''}`}
                    >
                      <polygon points="4,6 12,6 8,12" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Color Picker Dropdown */}
                  {showColorPicker && !isUpdating && (
                    <div
                      className="mt-1 rounded-md [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] animate-in fade-in-0 zoom-in-95 duration-200"
                      style={{
                        display: 'block',
                        position: 'absolute',
                        top: '-215%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        zIndex: 80,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        maxHeight: '300px',
                        overflowY: 'auto'
                      }}
                    >
                      <div className="p-4">
                        <div className="mb-3">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Preset Colors
                          </p>
                          <div className="grid grid-cols-6 gap-2">
                            {defaultColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-full aspect-square rounded-md border-2 transition-all duration-200 hover:scale-110 ${
                                  categoryColor === color
                                    ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-400 shadow-md'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorSelect(color)}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                        
                        {/* Custom Color Input */}
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Custom Color
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={categoryColor}
                              onChange={(e) => setCategoryColor(e.target.value)}
                              className="w-12 h-8 rounded border border-gray-300 cursor-pointer transition-colors duration-200"
                            />
                            <input
                              type="text"
                              value={categoryColor}
                              onChange={(e) => setCategoryColor(e.target.value)}
                              placeholder="#000000"
                              className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-[12px] font-mono focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none transition-colors duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Statistics */}
              <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4">
                <h3 className="text-[16px] font-bold mb-3">Category Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-[24px] font-bold text-gray-900">{initialData?.productCount || 0}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[24px] font-bold text-gray-900">{initialData?.totalStock || 0}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Total Stock</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[24px] font-bold text-gray-900">
                      ₱{(initialData?.totalValue || 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">Total Value</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex justify-end gap-2 mt-4 text-[12px] font-bold">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isUpdating}
              className="border border-gray-300 hover:bg-gray-200 rounded-md px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUpdating || !categoryName.trim()}
              className="bg-[#02367B] text-white rounded-md px-3 py-1 hover:bg-[#1C4A9E] border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                'Update Category'
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default EditCategoryModal;
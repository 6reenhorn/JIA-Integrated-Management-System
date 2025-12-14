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
  const [selectedColor, setSelectedColor] = useState('#10B981');
  const [isClosing, setIsClosing] = useState(false);
  const [wasUpdating, setWasUpdating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Color palette matching AddCategoryModal exactly
  const colors = [
    '#10B981', // green
    '#EF4444', // red
    '#F59E0B', // orange/yellow
    '#EC4899', // pink/magenta
    '#3B82F6', // blue
    '#B91C1C', // dark red
    '#F97316', // orange
    '#F472B6', // light pink
    '#22C55E', // bright green
    '#06D6A0', // teal/cyan
    '#8B5CF6', // purple
    '#84CC16', // lime
    '#0EA5E9', // sky blue
    '#1E40AF', // dark blue
    '#312E81', // very dark blue
    '#0F766E', // dark teal
    '#6B7280', // gray
    '#047857', // dark green
  ];

  const handleCancel = useCallback(() => {
    if (isUpdating) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  }, [isUpdating, onClose]);

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

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isUpdating) {
        handleCancel();
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
  }, [isOpen, isUpdating, handleCancel]);

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
      setSelectedColor(initialData.color || '#10B981');
    }
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    if (isUpdating || !categoryName.trim()) return;
    
    if (initialData) {
      onSave(initialData.name, categoryName.trim(), selectedColor);
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
                    className="w-full border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isUpdating) {
                        handleSubmit();
                      }
                    }}
                  />
                </div>

                {/* Color Picker */}
                <div className="mt-2">
                  <label className="text-[12px] font-bold">Category Color</label>
                  <div className="grid grid-cols-6 gap-3 mt-2">
                    {colors.map((color, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        disabled={isUpdating}
                        className={`w-10 h-10 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                          selectedColor === color 
                            ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' 
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-4 p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-gray-700">Preview:</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: selectedColor }}
                      />
                      <span className="text-[12px] text-gray-600">
                        {categoryName || 'Category Name'}
                      </span>
                    </div>
                  </div>
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
              className="border border-gray-300 hover:bg-gray-200 rounded-md px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUpdating || !categoryName.trim()}
              className="bg-[#02367B] text-white rounded-md px-3 py-1 hover:bg-[#1C4A9E] border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
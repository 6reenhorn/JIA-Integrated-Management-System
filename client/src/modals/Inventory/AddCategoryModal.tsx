import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import Portal from '../../components/common/Portal';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (categoryName: string, color: string) => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#10B981');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setCategoryName('');
    setSelectedColor('#10B981');
    setErrors({});
    setShowValidationAlert(false);
    setMissingFields([]);
    onClose();
  }, [onClose]);

  const handleCancel = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      handleClose();
      setIsClosing(false);
    }, 300);
  }, [handleClose]);

  useEffect(() => {
    if (isOpen) {
      setShowValidationAlert(false);
      setMissingFields([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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
  }, [isOpen, handleCancel]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleCancel]);

  // Color palette matching the design
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const missing: string[] = [];

    if (!categoryName.trim()) {
      newErrors.categoryName = 'Category name is required';
      missing.push('Category Name');
    }

    setErrors(newErrors);
    
    if (missing.length > 0) {
      setMissingFields(missing);
      setShowValidationAlert(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowValidationAlert(false);
      }, 5000);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Start closing animation
      setIsClosing(true);
      
      // Call onAddCategory immediately but close after animation
      onAddCategory(categoryName.trim(), selectedColor);
      
      // Wait for animation to complete before actually closing
      setTimeout(() => {
        setCategoryName('');
        setSelectedColor('#10B981');
        setErrors({});
        setShowValidationAlert(false);
        setMissingFields([]);
        setIsClosing(false);
        onClose();
      }, 300);
    }
  };

  const handleInputChange = (value: string) => {
    setCategoryName(value);
    
    // Hide validation alert when user starts typing
    if (showValidationAlert) {
      setShowValidationAlert(false);
    }
    
    // Clear error when user starts typing
    if (errors.categoryName) {
      setErrors(prev => ({
        ...prev,
        categoryName: ''
      }));
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
          <div>
            <h3 className="text-[20px] font-bold">Add Category</h3>
            <p className="text-[12px]">Create a new category with a custom name and color.</p>
          </div>

          {/* Validation Alert */}
          {showValidationAlert && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 animate-modal-in">
              <div className="flex gap-2">
                <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-red-800 mb-1">
                    Please fill in all required fields
                  </p>
                  <p className="text-xs text-red-700">
                    Missing: {missingFields.join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => setShowValidationAlert(false)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <div className="overflow-y-auto max-h-[550px] mt-4 text-[12px]">
            <div className="flex flex-col gap-3">
              {/* Category Details Section */}
              <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4">
                <h3 className="text-[16px] font-bold">Category Details</h3>
                
                {/* Category Name Field */}
                <div className="mt-2">
                  <label className="text-[12px] font-bold">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Enter category name"
                    className={`w-full border rounded-md px-2 py-1 focus:border-[#02367B] focus:ring-1 focus:ring-[#02367B] focus:outline-none ${
                      showValidationAlert && errors.categoryName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmit(e);
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
                        className={`w-10 h-10 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#02367B] ${
                          selectedColor === color 
                            ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' 
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
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex justify-end gap-2 mt-4 text-[12px] font-bold">
            <button
              type="button"
              onClick={handleCancel}
              className="border border-gray-300 hover:bg-gray-200 rounded-md px-3 py-1 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-[#02367B] text-white rounded-md px-3 py-1 hover:bg-[#1C4A9E] border border-gray-300 transition-colors duration-200"
            >
              Add Category
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default AddCategoryModal;
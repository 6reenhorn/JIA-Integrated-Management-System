import React, { useState } from 'react';
import { X } from 'lucide-react';

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
  const [selectedColor, setSelectedColor] = useState('#10B981'); // Default to first color

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onAddCategory(categoryName.trim(), selectedColor);
      setCategoryName('');
      setSelectedColor('#10B981');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add New Category</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02367B] focus:ring-offset-1 rounded-md p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <div className="px-6 pb-6">
          <div>
            {/* Category Details Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Category Details</h3>
              
              {/* Category Name Field */}
              <div className="space-y-2 mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02367B] focus:border-[#02367B] focus:outline-none transition-all bg-gray-50"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit(e);
                    }
                  }}
                />
              </div>

              {/* Color Picker Grid */}
              <div className="grid grid-cols-6 gap-3 mb-8">
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

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-1.5 bg-[#02367B] text-white rounded-md hover:bg-[#02367B]/90 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#02367B] focus:ring-offset-1"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;
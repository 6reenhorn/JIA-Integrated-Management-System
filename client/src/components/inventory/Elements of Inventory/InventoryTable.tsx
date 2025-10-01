import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import InventoryActions from './InventoryActions';
import type { InventoryItem } from '../../../types/inventory_types';
import { getStatusColor } from '../../../utils/inventory_utils';

interface InventoryTableProps {
  items: InventoryItem[];
  onViewItem: (id: number) => void;
  onEditItem: (id: number) => void;
  onDeleteItem: (id: number) => void;
  // Add pagination props
  currentPage: number;
  totalPages: number;
  filteredCount: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onEditItem,
  onDeleteItem,
  currentPage,
  totalPages,
  filteredCount,
  totalCount,
  onPageChange
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDeleteClick = (id: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId !== null) {
      onDeleteItem(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const renderDeleteConfirmation = (itemId: number) => {
    if (deleteConfirmId !== itemId) return null;

    return (
      <div className="absolute top-0 right-0 mt-2 mr-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 w-64">
        <div className="mb-2">
          <h3 className="text-xs font-semibold text-gray-900">Confirm Delete</h3>
          <p className="text-xs text-gray-600 mt-1">
            Are you sure you want to delete this inventory item?
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCancelDelete}
            className="flex-1 px-2 py-1 text-gray-700 bg-gray-100 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            No
          </button>
          <button
            onClick={handleConfirmDelete}
            className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
          >
            Yes
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="relative">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {item.productName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.category}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.stock} Units
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                    item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                    item.status === 'Out Of Stock' ? 'bg-red-100 text-red-800' :
                    getStatusColor(item.status)
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  ₱{item.productPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  ₱{item.totalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-left text-sm relative">
                  <div className="flex justify-start space-x-2">
                    <button 
                      onClick={() => onEditItem(item.id)}
                      className="text-black hover:text-black p-1 rounded-full hover:bg-gray-100" 
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClick(item.id, e)}
                      className="text-black hover:text-black p-1 rounded-full hover:bg-gray-100" 
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {renderDeleteConfirmation(item.id)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Actions */}
      <InventoryActions 
        currentPage={currentPage}
        totalPages={totalPages}
        filteredCount={filteredCount}
        totalCount={totalCount}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default InventoryTable;
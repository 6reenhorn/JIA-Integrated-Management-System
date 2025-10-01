import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import InventoryActions from './InventoryActions';
import type { InventoryItem } from '../../../types/inventory_types';

interface InventoryTableProps {
  items: InventoryItem[];
  onViewItem: (id: number) => void;
  onEditItem: (id: number) => void;
  onDeleteItem: (id: number) => void;
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

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="overflow-x-auto border-2 border-[#E5E7EB] rounded-lg">
          {/* Fixed Header */}
          <table className="table-fixed bg-[#EDEDED] w-full">
            <thead className="border-[#E5E7EB] border-b">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[180px]">Product Name</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[140px]">Category</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">Stock</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[130px]">Product Price</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[130px]">Total Amount</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">Actions</th>
              </tr>
            </thead>
          </table>
          
          {/* Empty State Content with Fixed Height */}
          <div className="h-[335px] flex items-center justify-center">
            <p className="text-gray-500">
              No inventory items found. Add your first product to get started.
            </p>
          </div>
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
  }

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="overflow-x-auto border-2 border-[#E5E7EB] rounded-lg">
        <table className="table-fixed bg-[#EDEDED] w-full">
          <thead className="border-[#E5E7EB] border-b">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[180px]">Product Name</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[140px]">Category</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">Stock</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">Status</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[130px]">Product Price</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[130px]">Total Amount</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">Actions</th>
            </tr>
          </thead>
        </table>
        
        <div className="h-[335px] overflow-y-auto">
          <table className="table-fixed w-full h-full">
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 relative">
                  <td className="py-4 px-6 w-[180px]">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {item.productName}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 w-[140px]">
                    <div className="truncate">
                      {item.category}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 w-[100px]">
                    {item.stock} Units
                  </td>
                  <td className="py-4 px-6 w-[120px]">
                    <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                      item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                      item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'Out Of Stock' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 w-[130px]">
                    ₱{item.productPrice.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900 w-[130px]">
                    ₱{item.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-left text-sm w-[100px] relative">
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
              {items.length < 10 && (
                <tr className="h-full">
                  <td colSpan={7} className="h-full"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
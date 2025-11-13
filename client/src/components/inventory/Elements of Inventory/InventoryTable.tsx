import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import InventoryActions from './InventoryActions';
import DeleteInventoryItemModal from '../../../modals/Inventory/DeleteInventoryItemModal';
import type { InventoryItem } from '../../../types/inventory_types';

interface InventoryTableProps {
  items: InventoryItem[];
  onViewItem: (id: number) => void;
  onEditItem: (id: number) => void;
  onDeleteItem: (id: number) => void;
  currentPage: number;
  filteredCount: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean; // Add loading prop
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onEditItem,
  onDeleteItem,
  currentPage,
  filteredCount,
  totalCount,
  onPageChange,
  isLoading = false // Default to false
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const handleDeleteClick = (item: InventoryItem, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      setIsDeleting(true);
      try {
        await onDeleteItem(itemToDelete.id);
        setDeleteModalOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error('Error deleting item:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCloseModal = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  // Paginate items - get only items for current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, endIndex);

  // Calculate actual total pages based on items length - ensure at least 1 page
  const actualTotalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));

  // Loading State
  if (isLoading) {
    return (
      <div className="border-2 border-[#E5E7EB] rounded-lg min-h-[390px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-500">Loading inventory items...</p>
        </div>
      </div>
    );
  }

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
          currentPage={1}
          totalPages={1}
          filteredCount={filteredCount}
          totalCount={totalCount}
          onPageChange={onPageChange}
        />
      </div>
    );
  }

  return (
    <>
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
                {paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
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
                    <td className="py-4 px-6 text-left text-sm w-[100px]">
                      <div className="flex justify-start space-x-2">
                        <button 
                          onClick={() => onEditItem(item.id)}
                          className="text-black hover:text-black p-1 rounded-full hover:bg-gray-100" 
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteClick(item, e)}
                          className="text-black hover:text-black p-1 rounded-full hover:bg-gray-100" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedItems.length < ITEMS_PER_PAGE && (
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
          totalPages={actualTotalPages}
          filteredCount={filteredCount}
          totalCount={totalCount}
          onPageChange={onPageChange}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteInventoryItemModal
        isOpen={deleteModalOpen}
        onClose={handleCloseModal}
        onConfirmDelete={handleConfirmDelete}
        item={itemToDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default InventoryTable;
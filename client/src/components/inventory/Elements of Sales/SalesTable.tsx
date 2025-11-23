import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import DeleteSalesRecordModal from '../../../modals/Inventory/DeleteSalesRecordModal';
import { useDateFormat } from '../../../context/DateFormatContext';

export type SalesRecord = {
  id: number;
  date: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay';
};

interface SalesTableProps {
  salesRecords: SalesRecord[];
  onEditSale: (id: number) => void;
  onDeleteSale: (id: number) => void;
  currentPage: number;
  isLoading?: boolean;
  isAdding?: boolean;
  isDeletingRecord?: boolean;
}

const SalesTable: React.FC<SalesTableProps> = ({
  salesRecords,
  onEditSale,
  onDeleteSale,
  currentPage,
  isLoading = false,
  isAdding = false,
  isDeletingRecord = false
}) => {
  const { formatDate } = useDateFormat()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<SalesRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const handleDeleteClick = (record: SalesRecord, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setRecordToDelete(record);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (recordToDelete) {
      setIsDeleting(true);
      try {
        await onDeleteSale(recordToDelete.id);
        setDeleteModalOpen(false);
        setRecordToDelete(null);
      } catch (error) {
        console.error('Error deleting sales record:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCloseModal = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setRecordToDelete(null);
    }
  };

  // Paginate items - get only items for current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = salesRecords.slice(startIndex, endIndex);

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-2 border-[#E5E7EB] rounded-lg min-h-[390px] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-500">Loading sales records...</p>
          </div>
        </div>
      </div>
    );
  }

  if (salesRecords.length === 0) {
    return (
      <div className="space-y-6">
        <div className="overflow-x-auto border-2 border-[#E5E7EB] rounded-lg">
          {/* Fixed Header */}
          <table className="table-fixed bg-[#EDEDED] w-full">
            <thead className={`border-[#E5E7EB] border-b ${isAdding ? 'bg-gradient-to-r from-green-300 via-green-500 to-green-300 bg-[length:200%_100%] animate-[gradient_2s_ease-in-out_infinite]' : isDeletingRecord ? 'bg-gradient-to-r from-red-300 via-red-500 to-red-300 bg-[length:200%_100%] animate-[gradient_2s_ease-in-out_infinite]' : 'bg-[#EDEDED]'}`}>
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[180px]">Date</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[140px]">Product Name</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">Quantity</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">Price</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[130px]">Total</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[130px]">Payment Method</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">Actions</th>
              </tr>
            </thead>
          </table>
          
          {/* Empty State Content with Fixed Height */}
          <div className="h-[335px] flex items-center justify-center">
            <p className="text-gray-500">
              No sales records found. Add your first sales to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Table */}
        <div className="overflow-x-auto border-2 border-[#E5E7EB] rounded-lg">
          <table className="table-fixed bg-[#EDEDED] w-full">
            <thead className={`border-[#E5E7EB] border-b ${isAdding ? 'bg-gradient-to-r from-green-300 via-green-500 to-green-300 bg-[length:200%_100%] animate-[gradient_2s_ease-in-out_infinite]' : isDeletingRecord ? 'bg-gradient-to-r from-red-300 via-red-500 to-red-300 bg-[length:200%_100%] animate-[gradient_2s_ease-in-out_infinite]' : 'bg-[#EDEDED]'}`}>
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[180px]">Date</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[140px]">Product Name</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">Quantity</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">Price</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[130px]">Total</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[130px]">Payment Method</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">Actions</th>
              </tr>
            </thead>
          </table>
          
          <div className="h-[335px] overflow-y-auto">
            <table className="table-fixed w-full h-full">
              <tbody className="divide-y divide-gray-200">
                {paginatedItems.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 w-[180px]">
                      <div className="text-sm text-gray-900 truncate">
                        {formatDate(new Date(record.date))}
                      </div>
                    </td>
                    <td className="py-4 px-6 w-[140px]">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {record.productName}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 w-[100px]">
                      {record.quantity}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 w-[120px]">
                      ₱{record.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 w-[130px]">
                      ₱{record.total.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 w-[130px]">
                      <div className="truncate">
                        {record.paymentMethod}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-left text-sm w-[100px]">
                      <div className="flex justify-start space-x-2">
                        <button
                          onClick={() => onEditSale(record.id)}
                          className="text-black hover:text-black p-1 rounded-full hover:bg-gray-100"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(record, e)}
                          className="text-black hover:text-black p-1 rounded-full hover:bg-gray-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedItems.length < 10 && (
                  <tr className="h-full">
                    <td colSpan={7} className="h-full"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteSalesRecordModal
        isOpen={deleteModalOpen}
        onClose={handleCloseModal}
        onConfirmDelete={handleConfirmDelete}
        record={recordToDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default SalesTable;
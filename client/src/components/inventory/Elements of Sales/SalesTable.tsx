import React, { useState, useMemo } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import DeleteSalesRecordModal from '../../../modals/Inventory/DeleteSalesRecordModal';
import Skeleton from '../../common/Skeleton';
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

  // Sort sales records with newest first
  const sortedSalesRecords = useMemo(() => {
    return [...salesRecords].sort((a, b) => {
      // Sort by date in descending order (newest first)
      const dateA = new Date(a.date + 'T00:00:00').getTime();
      const dateB = new Date(b.date + 'T00:00:00').getTime();
      
      // If dates are equal, sort by ID (newer IDs first)
      if (dateA === dateB) {
        return b.id - a.id;
      }
      
      return dateB - dateA;
    });
  }, [salesRecords]);

  // Local date formatter to avoid timezone issues
  const formatLocalDate = (dateString: string): string => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return formatDate(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

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
          // Delete successful - modal will close automatically after animation
          // Don't close modal here, let the animation handle it
        } catch (error) {
          console.error('Error deleting sales record:', error);
          // On error, close immediately
          setDeleteModalOpen(false);
          setRecordToDelete(null);
        } finally {
          setIsDeleting(false);
        }
      }
    };

    const handleCloseModal = () => {
      setDeleteModalOpen(false);
      setRecordToDelete(null);
      setIsDeleting(false);
    };
    
  // Paginate sorted items - get only items for current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = sortedSalesRecords.slice(startIndex, endIndex);

  // Loading State
  if (isLoading) {
    const skeletonCount = Math.min(sortedSalesRecords.length || 10, ITEMS_PER_PAGE);
    
    return (
      <div className="space-y-6">
        <div className="border-2 border-[#E5E7EB] rounded-lg overflow-hidden">
          <table className="table-fixed bg-[#EDEDED] w-full">
            <thead className="border-[#E5E7EB] border-b bg-[#EDEDED]">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[180px]">Date</th>
                <th className="text-left py-4 px-5 text-sm font-medium text-gray-500 w-[140px]">Product Name</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500 w-[100px]">Quantity</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">Price</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500 w-[130px]">Total</th>
                <th className="text-left py-4 px-3.5 text-sm font-medium text-gray-500 w-[130px]">Payment Method</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500 w-[100px]">Actions</th>
              </tr>
            </thead>
          </table>
          
          <div className="h-[335px] overflow-hidden">
            <table className="table-fixed w-full">
              <tbody className="divide-y divide-gray-200">
                {Array.from({ length: skeletonCount }).map((_, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-4 px-6 w-[180px]">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-4 px-5 w-[140px]">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="py-4 px-4 w-[100px]">
                      <Skeleton className="h-4 w-14" />
                    </td>
                    <td className="py-4 px-6 w-[120px]">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="py-4 px-4 w-[130px]">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="py-4 px-3.5 w-[130px]">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-4 px-4 w-[100px]">
                      <div className="flex justify-start space-x-3">
                        <Skeleton className="w-6 h-6" />
                        <Skeleton className="w-6 h-6" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (sortedSalesRecords.length === 0) {
    return (
      <div className="space-y-6">
        <div className="overflow-x-auto border-2 border-[#E5E7EB] rounded-lg">
          {/* Fixed Header */}
          <table className="table-fixed bg-[#EDEDED] w-full">
            <thead className={`border-[#E5E7EB] border-b ${isAdding ? 'bg-gradient-to-r from-green-300 via-green-500 to-green-300 bg-[length:200%_100%] animate-[gradient_2s_ease-in-out_infinite]' : isDeletingRecord ? 'bg-gradient-to-r from-red-300 via-red-500 to-red-300 bg-[length:200%_100%] animate-[gradient_2s_ease-in-out_infinite]' : 'bg-[#EDEDED]'}`}>
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[180px]">Date</th>
                <th className="text-left py-4 px-5 text-sm font-medium text-gray-500 w-[140px]">Product Name</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500 w-[100px]">Quantity</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">Price</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500 w-[130px]">Total</th>
                <th className="text-left py-4 px-3.5 text-sm font-medium text-gray-500 w-[130px]">Payment Method</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500 w-[100px]">Actions</th>
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
                <th className="text-left py-4 px-5 text-sm font-medium text-gray-500 w-[140px]">Product Name</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500 w-[100px]">Quantity</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">Price</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500 w-[130px]">Total</th>
                <th className="text-left py-4 px-3.5 text-sm font-medium text-gray-500 w-[130px]">Payment Method</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500 w-[100px]">Actions</th>
              </tr>
            </thead>
          </table>
          
          <div className="h-[335px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none">
            <table className="table-fixed w-full h-full">
              <tbody className="divide-y divide-gray-200">
                {paginatedItems.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 w-[180px]">
                      <div className="text-sm text-gray-900 truncate">
                        {formatLocalDate(record.date)}
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
                      ₱{record.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 w-[130px]">
                      ₱{record.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                {paginatedItems.length < ITEMS_PER_PAGE && (
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
import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';

export type SalesRecord = {
  id: number;
  date: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Card';
};

interface SalesTableProps {
  salesRecords: SalesRecord[];
  onEditSale: (id: number) => void;
  onDeleteSale: (id: number) => void;
}

const SalesTable: React.FC<SalesTableProps> = ({ salesRecords, onEditSale, onDeleteSale }) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDeleteClick = (id: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId !== null) {
      onDeleteSale(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const renderDeleteConfirmation = (recordId: number) => {
    if (deleteConfirmId !== recordId) return null;

    return (
      <div className="absolute top-0 right-0 mt-2 mr-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 w-64">
        <div className="mb-2">
          <h3 className="text-xs font-semibold text-gray-900">Confirm Delete</h3>
          <p className="text-xs text-gray-600 mt-1">
            Are you sure you want to delete this sales record?
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

  if (salesRecords.length === 0) {
    return (
      <div className="space-y-6">
        <div className="overflow-x-auto border-2 border-[#E5E7EB] rounded-lg">
          {/* Fixed Header */}
          <table className="table-fixed bg-[#EDEDED] w-full">
            <thead className="border-[#E5E7EB] border-b">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[140px]">Date</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[180px]">Product Name</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">Quantity</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">Price</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">Total</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[140px]">Payment Method</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">Actions</th>
              </tr>
            </thead>
          </table>
          
          {/* Empty State Content with Fixed Height */}
          <div className="h-[335px] flex items-center justify-center">
            <p className="text-gray-500">
              No sales records found for this date.
            </p>
          </div>
        </div>
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
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[140px]">Date</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[180px]">Product Name</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">Quantity</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">Price</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">Total</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[140px]">Payment Method</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">Actions</th>
            </tr>
          </thead>
        </table>
        
        <div className="h-[335px] overflow-y-auto">
          <table className="table-fixed w-full h-full">
            <tbody className="divide-y divide-gray-200">
              {salesRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 relative">
                  <td className="py-4 px-6 w-[140px]">
                    <div className="text-sm text-gray-900 truncate">
                      {record.date}
                    </div>
                  </td>
                  <td className="py-4 px-6 w-[180px]">
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
                  <td className="py-4 px-6 text-sm font-medium text-gray-900 w-[120px]">
                    ₱{record.total.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 w-[140px]">
                    <div className="truncate">
                      {record.paymentMethod}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-left text-sm w-[100px] relative">
                    <div className="flex justify-start space-x-2">
                      <button
                        onClick={() => onEditSale(record.id)}
                        className="text-black hover:text-black p-1 rounded-full hover:bg-gray-100"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(record.id, e)}
                        className="text-black hover:text-black p-1 rounded-full hover:bg-gray-100"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {renderDeleteConfirmation(record.id)}
                  </td>
                </tr>
              ))}
              {salesRecords.length < 10 && (
                <tr className="h-full">
                  <td colSpan={7} className="h-full"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesTable;
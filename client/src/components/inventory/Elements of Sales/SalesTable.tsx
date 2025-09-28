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
      <div className="absolute top-0 right-0 mt-2 mr-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-80">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Confirm Delete</h3>
          <p className="text-xs text-gray-600 mt-1">
            Are you sure you want to delete this sales record?
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCancelDelete}
            className="flex-1 px-3 py-1.5 text-gray-700 bg-gray-100 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            No
          </button>
          <button
            onClick={handleConfirmDelete}
            className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
          >
            Yes
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 relative">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salesRecords.map((record) => (
              <tr key={record.id} className="relative">
                <td className="px-6 py-4 text-sm text-gray-900">{record.date}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{record.productName}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{record.quantity}</td>
                <td className="px-6 py-4 text-sm text-gray-900">₱{record.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">₱{record.total.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{record.paymentMethod}</td>
                <td className="px-6 py-4 text-right text-sm relative">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onEditSale(record.id)}
                      className="text-black hover:text-black p-1 rounded-full hover:bg-gray-100"
                      title="Edit Sale"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(record.id, e)}
                      className="text-black hover:text-black p-1 rounded-full hover:bg-gray-100"
                      title="Delete Sale"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {renderDeleteConfirmation(record.id)}
                </td>
              </tr>
            ))}
            {salesRecords.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                  No sales records found for this date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesTable;
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

export type SalesRecord = {
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
  return (
    <div className="space-y-4">
      {/* Table */}
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
            {salesRecords.map((record, index) => (
              <tr key={index}>
                <td className="px-6 py-4 text-sm text-gray-900">{record.date}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{record.productName}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{record.quantity}</td>
                <td className="px-6 py-4 text-sm text-gray-900">₱{record.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">₱{record.total.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{record.paymentMethod}</td>
                <td className="px-6 py-4 text-right text-sm">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onEditSale(index + 1)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-gray-100"
                      title="Edit Sale"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSale(index + 1)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-gray-100"
                      title="Delete Sale"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
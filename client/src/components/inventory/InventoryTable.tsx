import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import type { InventoryItem } from '../../types/inventory_types';
import { getStatusColor } from '../../utils/inventory_utils';

interface InventoryTableProps {
  items: InventoryItem[];
  onViewItem: (id: number) => void;
  onEditItem: (id: number) => void;
  onDeleteItem: (id: number) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onViewItem,
  onEditItem,
  onDeleteItem
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Product Name</th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Category</th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Storage Location</th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Product Price</th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Quantity</th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="py-4 px-6 text-sm font-medium text-gray-900">
                {item.productName}
              </td>
              <td className="py-4 px-6 text-sm text-gray-600">
                {item.category}
              </td>
              <td className="py-4 px-6 text-sm text-gray-600">
                {item.storageLocation}
              </td>
              <td className="py-4 px-6">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </td>
              <td className="py-4 px-6 text-sm text-gray-900">
                ₱{item.productPrice.toFixed(2)}
              </td>
              <td className="py-4 px-6 text-sm text-gray-600">
                {item.quantity || 0}
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onViewItem(item.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors" 
                    title="View"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => onEditItem(item.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors" 
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors" 
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
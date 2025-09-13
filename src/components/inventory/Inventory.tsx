// src/components/inventory/Inventory.tsx
import React, { useState } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, Package, AlertTriangle, XCircle, TrendingDown } from 'lucide-react';
import DashboardCard from '../view/DashboardCard';

interface InventoryItem {
  id: number;
  productName: string;
  category: string;
  storageLocation: string;
  status: 'Good' | 'Low Stock' | 'Out Of Stock' | 'Expired';
  productPrice: number;
  quantity?: number;
}

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Sample inventory data matching your original screenshot
  const [inventoryItems] = useState<InventoryItem[]>([
    {
      id: 1,
      productName: 'Chicharon ni Madam',
      category: 'Chichirira',
      storageLocation: 'Shelf 1',
      status: 'Good',
      productPrice: 69.69,
      quantity: 25
    },
    {
      id: 2,
      productName: 'Tubig nga gamay',
      category: 'Drinkables',
      storageLocation: 'Refrigerator',
      status: 'Low Stock',
      productPrice: 20.20,
      quantity: 5
    },
    {
      id: 3,
      productName: 'Tubig nga gamay',
      category: 'Chichirira',
      storageLocation: 'Shelf 1',
      status: 'Out Of Stock',
      productPrice: 50.00,
      quantity: 0
    }
  ]);

  // Calculate summary stats
  const stats = {
    totalItems: inventoryItems.length,
    lowStockItems: inventoryItems.filter(item => item.status === 'Low Stock').length,
    expiredItems: inventoryItems.filter(item => item.status === 'Expired').length,
    outOfStockItems: inventoryItems.filter(item => item.status === 'Out Of Stock').length,
  };

  // Filter items based on search and category
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: InventoryItem['status']): string => {
    switch (status) {
      case 'Good':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out Of Stock':
        return 'bg-red-100 text-red-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewItem = (id: number) => {
    console.log('View item:', id);
  };

  const handleEditItem = (id: number) => {
    console.log('Edit item:', id);
  };

  const handleDeleteItem = (id: number) => {
    console.log('Delete item:', id);
  };

  const handleAddItem = () => {
    console.log('Add new item');
  };

  const categories = Array.from(new Set(inventoryItems.map(item => item.category)));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard title="Total Items">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalItems}</p>
              <p className="text-sm text-gray-500 mt-1">All inventory items</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </DashboardCard>

        <DashboardCard title="Low Stock Items">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-yellow-600">{stats.lowStockItems}</p>
              <p className="text-sm text-gray-500 mt-1">Need restocking</p>
            </div>
            <TrendingDown className="h-8 w-8 text-yellow-500" />
          </div>
        </DashboardCard>

        <DashboardCard title="Expired Items">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-red-600">{stats.expiredItems}</p>
              <p className="text-sm text-gray-500 mt-1">Past expiry date</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </DashboardCard>

        <DashboardCard title="Out of Stock Items">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-red-600">{stats.outOfStockItems}</p>
              <p className="text-sm text-gray-500 mt-1">No stock available</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </DashboardCard>
      </div>

      {/* Main Inventory Management */}
      <DashboardCard title="Inventory Management">
        {/* Header Controls */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <p className="text-gray-600 mb-4 sm:mb-0">
              Manage your inventory items, stock levels, and product information.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search Items"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                
                <button 
                  onClick={handleAddItem}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Items
                </button>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">Features:</div>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 grid grid-cols-2 md:grid-cols-4 gap-2">
              <li>Track stock levels</li>
              <li>Add new products</li>
              <li>Update product information</li>
              <li>Monitor low stock alerts</li>
            </ul>
          </div>
        </div>

        {/* Inventory Table */}
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
              {filteredItems.map((item) => (
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
                        onClick={() => handleViewItem(item.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors" 
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => handleEditItem(item.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors" 
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
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

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="text-sm text-gray-500">
            Page {currentPage} of 1 • Showing {filteredItems.length} of {inventoryItems.length} items
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button className="px-3 py-1 text-sm bg-gray-900 text-white rounded">
              1
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              3
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default Inventory;
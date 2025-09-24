import React, { useState, useMemo } from 'react';
import InventoryStats from '../components/inventory/InventoryStats';
import InventoryFilters from '../components/inventory/InventoryFilters';
import InventoryTable from '../components/inventory/InventoryTable';
import InventoryActions from '../components/inventory/InventoryActions';
import AddProductModal from '../modals/Inventory/AddProductModal';
import EditProductModal from '../modals/Inventory/EditProductModal';
import type { InventoryItem, ProductFormData } from '../types/inventory_types';
import { filterInventoryItems, calculateStats } from '../utils/inventory_utils';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();
  
  // Corrected inventory data with proper calculations
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: 1,
      productName: 'Product 1',
      category: 'Category 1',
      stock: 69,
      status: 'In Stock',
      productPrice: 69.69,
      totalAmount: 69 * 69.69 // = 4808.61
    },
    {
      id: 2,
      productName: 'Product 2',
      category: 'Category 2',
      stock: 10,
      status: 'Low Stock',
      productPrice: 20.20,
      totalAmount: 10 * 20.20 // = 202.00
    },
    {
      id: 3,
      productName: 'Product 3',
      category: 'Category 3',
      stock: 5,
      status: 'Low Stock',
      productPrice: 50.00,
      totalAmount: 5 * 50.00 // = 250.00
    },
    {
      id: 4,
      productName: 'Product 4',
      category: 'Category 4',
      stock: 0,
      status: 'Out Of Stock',
      productPrice: 5.00,
      totalAmount: 0 * 5.00 // = 0.00
    },
    {
      id: 5,
      productName: 'Product 5',
      category: 'Category 5',
      stock: 69,
      status: 'In Stock',
      productPrice: 30.00,
      totalAmount: 69 * 30.00 // = 2070.00
    }
  ]);

  // Calculate stats
  const stats = useMemo(() => calculateStats(inventoryItems), [inventoryItems]);

  // Filter items based on search and category
  const filteredItems = useMemo(() => 
    filterInventoryItems(inventoryItems, searchTerm, selectedCategory),
    [inventoryItems, searchTerm, selectedCategory]
  );

  // Get unique categories
  const categories = useMemo(() => 
    Array.from(new Set(inventoryItems.map(item => item.category))),
    [inventoryItems]
  );

  const handleViewItem = (id: number) => {
    console.log('View item:', id);
  };

  const handleEditItem = (id: number) => {
    const item = inventoryItems.find(item => item.id === id);
    if (item) {
      setEditingItem(item);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteItem = (id: number) => {
    setInventoryItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddItem = () => {
    setIsAddModalOpen(true);
  };

  // Helper function to determine status based on stock quantity
  const getStatusFromStock = (stock: number, minimumStock: number = 10) => {
    if (stock === 0) return 'Out Of Stock';
    if (stock <= minimumStock) return 'Low Stock';
    return 'In Stock';
  };

  const handleAddProduct = (productData: ProductFormData) => {
    const totalAmount = productData.productPrice * productData.quantity;
    
    const newProduct: InventoryItem = {
      id: Math.max(...inventoryItems.map(item => item.id), 0) + 1,
      productName: productData.productName,
      category: productData.category,
      stock: productData.quantity,
      status: getStatusFromStock(productData.quantity),
      productPrice: productData.productPrice,
      totalAmount: totalAmount
    };

    setInventoryItems(prev => [...prev, newProduct]);
  };

  const handleSaveProduct = (updatedItem: InventoryItem) => {
    // Recalculate total amount and status before saving
    const totalAmount = updatedItem.stock * updatedItem.productPrice;
    
    const finalItem = {
      ...updatedItem,
      status: getStatusFromStock(updatedItem.stock),
      totalAmount: totalAmount
    };

    setInventoryItems(prev => 
      prev.map(item => 
        item.id === finalItem.id ? finalItem : item
      )
    );
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(undefined);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <InventoryStats stats={stats} />
      
      {/* Header Controls */}
      <InventoryFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        onAddItem={handleAddItem}
      />

      {/* Inventory Table */}
      <InventoryTable
        items={filteredItems}
        onViewItem={handleViewItem}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
      />

      {/* Pagination */}
      <InventoryActions
        currentPage={currentPage}
        totalPages={Math.ceil(filteredItems.length / 10)}
        filteredCount={filteredItems.length}
        totalCount={inventoryItems.length}
        onPageChange={handlePageChange}
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProduct={handleAddProduct}
        categories={categories}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveProduct}
        initialData={editingItem}
        categories={categories}
      />
    </div>
  );
};

export default Inventory;
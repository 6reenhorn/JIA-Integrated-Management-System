import React, { useState, useMemo } from 'react';
import InventoryStats from '../components/inventory/InventoryStats';
import InventoryFilters from '../components/inventory/InventoryFilters';
import InventoryTable from '../components/inventory/InventoryTable';
import InventoryActions from '../components/inventory/InventoryActions';
import AddProductModal from '../components/inventory/AddProductModal';
import EditProductModal from '../components/inventory/EditProductModal'; // Add this import
import type { InventoryItem, ProductFormData } from '../types/inventory_types';
import { filterInventoryItems, calculateStats } from '../utils/inventory_utils';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Add states for Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();
  
  // Sample inventory data - now using state so we can update it
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: 1,
      productName: 'Chicharon ni Madam',
      category: 'Chichirina',
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
      category: 'Chichirina',
      storageLocation: 'Shelf 1',
      status: 'Out Of Stock',
      productPrice: 50.00,
      quantity: 0
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

  // Updated handleEditItem function
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

  const handleAddProduct = (productData: ProductFormData) => {
    const newProduct: InventoryItem = {
      id: Math.max(...inventoryItems.map(item => item.id), 0) + 1, // Generate new ID
      productName: productData.productName,
      category: productData.category,
      storageLocation: productData.storageLocation,
      status: productData.quantity === 0 ? 'Out Of Stock' : 
              productData.quantity <= (productData.minimumStock || 5) ? 'Low Stock' : 'Good',
      productPrice: productData.productPrice,
      quantity: productData.quantity
    };

    setInventoryItems(prev => [...prev, newProduct]);
  };

  // Add handler for saving edited product
  const handleSaveProduct = (updatedItem: InventoryItem) => {
    setInventoryItems(prev => 
      prev.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  };

  // Add handler for closing edit modal
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
        totalPages={Math.ceil(filteredItems.length / 10)} // Assuming 10 items per page
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

      {/* Add Edit Product Modal */}
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
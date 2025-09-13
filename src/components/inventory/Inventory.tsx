import React, { useState, useMemo } from 'react';
import DashboardCard from '../view/DashboardCard';
import InventoryStats from './InventoryStats';
import InventoryFilters from './InventoryFilters';
import InventoryTable from './InventoryTable';
import InventoryActions from './InventoryActions';
import type { InventoryItem } from './types';
import { filterInventoryItems, calculateStats } from './utils';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Sample inventory data
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
    console.log('Edit item:', id);
  };

  const handleDeleteItem = (id: number) => {
    console.log('Delete item:', id);
  };

  const handleAddItem = () => {
    console.log('Add new item');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <InventoryStats stats={stats} />

      {/* Main Inventory Management */}
      <DashboardCard title="Inventory Management">
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
      </DashboardCard>
    </div>
  );
};

export default Inventory;
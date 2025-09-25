import React, { useState, useMemo } from 'react';
import InventoryStats from '../components/inventory/Elements of Inventory/InventoryStats';
import InventoryFilters from '../components/inventory/Elements of Inventory/InventoryFilters';
import InventoryTable from '../components/inventory/Elements of Inventory/InventoryTable';
import InventoryActions from '../components/inventory/Elements of Inventory/InventoryActions';
import AddProductModal from '../modals/Inventory/AddProductModal';
import EditProductModal from '../modals/Inventory/EditProductModal';
import AddCategoryModal from '../modals/Inventory/AddCategoryModal';
import MainLayoutCard from '../components/layout/MainLayoutCard';
import CategoryContent from '../components/inventory/Elements of Category/CategoryContent';
import SalesFilters from '../components/inventory/Elements of Sales/SalesFilters';
import SalesTable from '../components/inventory/Elements of Sales/SalesTable';
import type { SalesRecord } from '../components/inventory/Elements of Sales/SalesTable';
import SalesActions from '../components/inventory/Elements of Sales/SalesActions';
import type { InventoryItem, ProductFormData } from '../types/inventory_types';
import { filterInventoryItems, calculateStats } from '../utils/inventory_utils';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();
  const [activeSection, setActiveSection] = useState('inventory');

  // Sales records state
  const [salesRecords] = useState<SalesRecord[]>([]);

  // Category colors
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({
    'Category 1': '#3B82F6',
    'Category 2': '#EF4444',
    'Category 3': '#10B981',
    'Category 4': '#F59E0B',
    'Category 5': '#EC4899',
  });

  // Inventory data
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    { id: 1, productName: 'Product 1', category: 'Category 1', stock: 69, status: 'In Stock', productPrice: 69.69, totalAmount: 69 * 69.69 },
    { id: 2, productName: 'Product 2', category: 'Category 2', stock: 10, status: 'Low Stock', productPrice: 20.20, totalAmount: 10 * 20.20 },
    { id: 3, productName: 'Product 3', category: 'Category 3', stock: 5, status: 'Low Stock', productPrice: 50.00, totalAmount: 5 * 50.00 },
    { id: 4, productName: 'Product 4', category: 'Category 4', stock: 0, status: 'Out Of Stock', productPrice: 5.00, totalAmount: 0 },
    { id: 5, productName: 'Product 5', category: 'Category 5', stock: 69, status: 'In Stock', productPrice: 30.00, totalAmount: 69 * 30.00 },
  ]);

  const sections = [
    { id: 'inventory', label: 'Inventory', key: 'inventory' },
    { id: 'sales', label: 'Sales', key: 'sales' },
    { id: 'category', label: 'Category', key: 'category' },
  ];

  // Stats
  const inventoryStats = useMemo(() => calculateStats(inventoryItems), [inventoryItems]);

  const categoryStats = useMemo(() => {
    const totalCategories = Array.from(new Set(inventoryItems.map(item => item.category))).length;
    const totalProducts = inventoryItems.length;
    const totalStock = inventoryItems.reduce((sum, item) => sum + item.stock, 0);
    const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalAmount, 0);

    return { totalItems: totalCategories, totalProducts, totalStock, totalValue, lowStockItems: 0, outOfStockItems: 0 };
  }, [inventoryItems]);

  // Filters
  const filteredItems = useMemo(
    () => filterInventoryItems(inventoryItems, searchTerm, selectedCategory),
    [inventoryItems, searchTerm, selectedCategory]
  );

  const categories = useMemo(
    () => Array.from(new Set(inventoryItems.map(item => item.category))),
    [inventoryItems]
  );

  const categoryData = useMemo(() => {
    const map = new Map();
    inventoryItems.forEach(item => {
      if (!map.has(item.category)) {
        map.set(item.category, {
          name: item.category,
          productCount: 0,
          totalStock: 0,
          totalValue: 0,
          color: categoryColors[item.category] || '#6B7280',
        });
      }
      const category = map.get(item.category);
      category.productCount++;
      category.totalStock += item.stock;
      category.totalValue += item.totalAmount;
    });
    return Array.from(map.values());
  }, [inventoryItems, categoryColors]);

  // Handlers
  const handleEditItem = (id: number) => {
    const item = inventoryItems.find(i => i.id === id);
    if (item) {
      setEditingItem(item);
      setIsEditModalOpen(true);
    }
  };
  const handleDeleteItem = (id: number) => setInventoryItems(prev => prev.filter(i => i.id !== id));
  const handleAddItem = () => setIsAddModalOpen(true);
  const handleAddCategory = () => setIsAddCategoryModalOpen(true);
  const handleAddSale = () => console.log('Add sale clicked');

  const handleEditSale = (id: number) => {
    console.log('Edit sale clicked for ID:', id);
  };

  const handleDeleteSale = (id: number) => {
    console.log('Delete sale clicked for ID:', id);
  };

  const handleSaveCategory = (categoryName: string, color: string) =>
    setCategoryColors(prev => ({ ...prev, [categoryName]: color }));

  const handleViewProducts = (categoryName: string) => {
    setActiveSection('inventory');
    setSelectedCategory(categoryName);
  };

  const handleAddProduct = (data: ProductFormData) => {
    const totalAmount = data.productPrice * data.quantity;
    const newProduct: InventoryItem = {
      id: Math.max(...inventoryItems.map(i => i.id), 0) + 1,
      productName: data.productName,
      category: data.category,
      stock: data.quantity,
      status:
        data.quantity === 0
          ? 'Out Of Stock'
          : data.quantity <= 10
          ? 'Low Stock'
          : 'In Stock',
      productPrice: data.productPrice,
      totalAmount,
    };
    setInventoryItems(prev => [...prev, newProduct]);
  };

  const handleSaveProduct = (updated: InventoryItem) => {
    const totalAmount = updated.stock * updated.productPrice;
    const finalItem = {
      ...updated,
      status:
        updated.stock === 0
          ? 'Out Of Stock'
          : updated.stock <= 10
          ? 'Low Stock'
          : 'In Stock',
      totalAmount,
    };
    setInventoryItems(prev => prev.map(i => (i.id === finalItem.id ? finalItem : i)));
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(undefined);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      {activeSection === 'inventory' ? (
        <InventoryStats stats={inventoryStats} />
      ) : activeSection === 'sales' ? (
        // Sales Stats
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-black mb-2">Total Sales</h3>
            <p className="text-3xl font-bold text-gray-900">{salesRecords.length}</p>
          </div>
        </div>
      ) : (
        // Category stats
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-black mb-2">Total Categories</h3>
            <p className="text-3xl font-bold text-gray-900">{categoryStats.totalItems}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-black mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900">{categoryStats.totalProducts}</p>
            <p className="text-xs text-gray-400 mt-1">Across all categories</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-black mb-2">Total Stock</h3>
            <p className="text-3xl font-bold text-gray-900">{categoryStats.totalStock}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-black mb-2">Total Value</h3>
            <p className="text-3xl font-bold text-gray-900">₱{categoryStats.totalValue.toLocaleString()}</p>
          </div>
        </div>
      )}

      <MainLayoutCard sections={sections} activeSection={activeSection} onSectionChange={setActiveSection}>
        {/* Inventory Section */}
        {activeSection === 'inventory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-0">
              <InventoryFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={categories}
                filterOpen={filterOpen}
                setFilterOpen={setFilterOpen}
                onAddItem={handleAddItem}
                totalItems={filteredItems.length}
                activeSection={activeSection}
                onAddCategory={handleAddCategory}
                showTabsAndTitle={false}
              />
            </div>

            <InventoryTable
              items={filteredItems}
              onViewItem={(id) => console.log('View item', id)}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
            />

            <InventoryActions
              currentPage={currentPage}
              totalPages={Math.ceil(filteredItems.length / 10)}
              filteredCount={filteredItems.length}
              totalCount={inventoryItems.length}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Category Section */}
        {activeSection === 'category' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-0">
              <InventoryFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={categories}
                filterOpen={filterOpen}
                setFilterOpen={setFilterOpen}
                onAddItem={handleAddCategory}
                totalItems={categoryData.length}
                activeSection={activeSection}
                onAddCategory={handleAddCategory}
                showTabsAndTitle={false}
              />
            </div>

            <CategoryContent
              categories={categoryData}
              currentPage={currentPage}
              totalPages={Math.ceil(categoryData.length / 10)}
              filteredCount={categoryData.length}
              totalCount={categoryData.length}
              onPageChange={handlePageChange}
              onViewProducts={handleViewProducts}
              showHeaderStats={false}
            />
          </div>
        )}

        {/* Sales Section */}
        {activeSection === 'sales' && (
          <div className="space-y-6">
            <SalesFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onAddSale={handleAddSale}
            />
            <SalesTable
              salesRecords={salesRecords}
              onEditSale={handleEditSale}
              onDeleteSale={handleDeleteSale}
            />
            <SalesActions
              currentPage={currentPage}
              totalPages={Math.ceil(salesRecords.length / 10)}
              filteredCount={salesRecords.length}
              totalCount={salesRecords.length}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </MainLayoutCard>

      {/* Modals */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProduct={handleAddProduct}
        categories={categories}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveProduct}
        initialData={editingItem}
        categories={categories}
      />

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAddCategory={handleSaveCategory}
      />
    </div>
  );
};

export default Inventory;
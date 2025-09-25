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
import type { InventoryItem, ProductFormData } from '../types/inventory_types';
import { filterInventoryItems, calculateStats } from '../utils/inventory_utils';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();
  const [activeSection, setActiveSection] = useState('inventory');
  
  // State to store category colors
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({
    'Category 1': '#3B82F6',
    'Category 2': '#EF4444',
    'Category 3': '#10B981',
    'Category 4': '#F59E0B',
    'Category 5': '#EC4899'
  });
  
  // Your existing inventory data
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: 1,
      productName: 'Product 1',
      category: 'Category 1',
      stock: 69,
      status: 'In Stock',
      productPrice: 69.69,
      totalAmount: 69 * 69.69
    },
    {
      id: 2,
      productName: 'Product 2',
      category: 'Category 2',
      stock: 10,
      status: 'Low Stock',
      productPrice: 20.20,
      totalAmount: 10 * 20.20
    },
    {
      id: 3,
      productName: 'Product 3',
      category: 'Category 3',
      stock: 5,
      status: 'Low Stock',
      productPrice: 50.00,
      totalAmount: 5 * 50.00
    },
    {
      id: 4,
      productName: 'Product 4',
      category: 'Category 4',
      stock: 0,
      status: 'Out Of Stock',
      productPrice: 5.00,
      totalAmount: 0 * 5.00
    },
    {
      id: 5,
      productName: 'Product 5',
      category: 'Category 5',
      stock: 69,
      status: 'In Stock',
      productPrice: 30.00,
      totalAmount: 69 * 30.00
    }
  ]);

  // Define sections for MainLayoutCard with proper key and label properties
  const sections = [
    { id: 'inventory', label: 'Inventory', key: 'inventory' },
    { id: 'category', label: 'Category', key: 'category' }
  ];

  // Calculate stats for inventory
  const inventoryStats = useMemo(() => calculateStats(inventoryItems), [inventoryItems]);

  // Calculate stats for categories
  const categoryStats = useMemo(() => {
    const totalCategories = Array.from(new Set(inventoryItems.map(item => item.category))).length;
    const totalProducts = inventoryItems.length;
    const totalStock = inventoryItems.reduce((sum, item) => sum + item.stock, 0);
    const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalAmount, 0);

    return {
      totalItems: totalCategories,
      totalValue: totalValue,
      lowStockItems: 0,
      outOfStockItems: 0,
      totalProducts: totalProducts,
      totalStock: totalStock
    };
  }, [inventoryItems]);

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

  // Prepare category data with colors
  const categoryData = useMemo(() => {
    const categoryMap = new Map();
    
    inventoryItems.forEach(item => {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, {
          name: item.category,
          productCount: 0,
          totalStock: 0,
          totalValue: 0,
          color: categoryColors[item.category] || '#6B7280'
        });
      }
      
      const category = categoryMap.get(item.category);
      category.productCount += 1;
      category.totalStock += item.stock;
      category.totalValue += item.totalAmount;
    });
    
    return Array.from(categoryMap.values());
  }, [inventoryItems, categoryColors]);

  // Event handlers
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

  const handleAddCategory = () => {
    setIsAddCategoryModalOpen(true);
  };

  const handleSaveCategory = (categoryName: string, color: string) => {
    console.log('Adding new category:', categoryName, 'with color:', color);
    setCategoryColors(prev => ({
      ...prev,
      [categoryName]: color
    }));
  };

  const handleViewProducts = (categoryName: string) => {
    setActiveSection('inventory');
    setSelectedCategory(categoryName);
  };

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
      {/* Summary Cards - Show for both sections but with different data */}
      {activeSection === 'inventory' ? (
        <InventoryStats stats={inventoryStats} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Categories</h3>
            <p className="text-3xl font-bold text-gray-900">{categoryStats.totalItems}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900">{categoryStats.totalProducts}</p>
            <p className="text-xs text-gray-400 mt-1">Across all categories</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Stock</h3>
            <p className="text-3xl font-bold text-gray-900">{categoryStats.totalStock}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Value</h3>
            <p className="text-3xl font-bold text-gray-900">
              ₱{categoryStats.totalValue.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <MainLayoutCard sections={sections} activeSection={activeSection} onSectionChange={setActiveSection}>
        {activeSection === 'inventory' && (
          <div className="space-y-6">
            <div className='flex justify-between items-center mb-0'>
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
                showTabsAndTitle={false} // Hide tabs since MainLayoutCard handles them
              />
            </div>

            <InventoryTable
              items={filteredItems}
              onViewItem={handleViewItem}
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

        {activeSection === 'category' && (
          <div className="space-y-6">
            <div className='flex justify-between items-center mb-0'>
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
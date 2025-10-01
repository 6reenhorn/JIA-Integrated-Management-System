import React, { useState, useMemo, useEffect } from 'react';
import InventoryStats from '../components/inventory/Elements of Inventory/InventoryStats';
import InventoryTable from '../components/inventory/Elements of Inventory/InventoryTable';
import AddProductModal from '../modals/Inventory/AddProductModal';
import EditProductModal from '../modals/Inventory/EditProductModal';
import AddCategoryModal from '../modals/Inventory/AddCategoryModal';
import AddSalesModal from '../modals/Inventory/AddSalesModal';
import CategoryContent from '../components/inventory/Elements of Category/CategoryContent';
import SalesStats from '../components/inventory/Elements of Sales/SalesStats';
import EditSaleModal from '../modals/Inventory/EditSaleModal';
import type { InventoryItem, ProductFormData } from '../types/inventory_types';
import { filterInventoryItems, calculateStats } from '../utils/inventory_utils';

// Updated SalesRecord type to match the modal
export type SalesRecord = {
  id: number;
  date: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Card';
};

interface InventoryProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ activeSection: propActiveSection, onSectionChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddSalesModalOpen, setIsAddSalesModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();
  
  // Sales Modal States
  const [isEditSaleModalOpen, setIsEditSaleModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<SalesRecord | null>(null);
  
  // Use prop if provided, otherwise use local state
  const [localActiveSection, setLocalActiveSection] = useState('inventory');
  const activeSection = propActiveSection || localActiveSection;

  // Notify parent component when section changes
  useEffect(() => {
    if (onSectionChange && propActiveSection === undefined) {
      onSectionChange(activeSection);
    }
  }, [activeSection, onSectionChange, propActiveSection]);

  // Sync with prop changes
  useEffect(() => {
    if (propActiveSection && propActiveSection !== activeSection) {
      setLocalActiveSection(propActiveSection);
    }
  }, [propActiveSection, activeSection]);

  // Sales records state with sample data - Updated with IDs
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([
    { id: 1, date: '2025-09-25', productName: 'Platos', quantity: 2, price: 15.00, total: 30.00, paymentMethod: 'Cash' },
    { id: 2, date: '2025-09-25', productName: 'Nova', quantity: 2, price: 16.00, total: 32.00, paymentMethod: 'Gcash' },
    { id: 3, date: '2025-09-25', productName: 'Mobee', quantity: 1, price: 8.00, total: 8.00, paymentMethod: 'PayMaya' },
    { id: 4, date: '2025-09-25', productName: 'Pencil', quantity: 2, price: 6.00, total: 12.00, paymentMethod: 'Cash' },
    { id: 5, date: '2025-09-25', productName: '1 whole paper', quantity: 1, price: 50.00, total: 50.00, paymentMethod: 'Cash' },
  ]);

  // Filter sales records by date and search term
  const filteredSalesRecords = useMemo(() => {
    let filtered = salesRecords;
    
    // Filter by date if a date is selected
    if (selectedDate) {
      filtered = filtered.filter(record => record.date === selectedDate);
    }
    
    // Filter by search term (searches product name)
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [salesRecords, selectedDate, searchTerm]);

  // Calculate sales stats from filtered records
  const salesStats = useMemo(() => {
    const totalSales = filteredSalesRecords.length;
    const totalAmount = filteredSalesRecords.reduce((sum, record) => sum + record.total, 0);
    const totalItemsSold = filteredSalesRecords.reduce((sum, record) => sum + record.quantity, 0);
    const averageSale = totalSales > 0 ? totalAmount / totalSales : 0;
    
    return {
      totalSales,
      totalAmount,
      averageSale,
      totalItemsSold
    };
  }, [filteredSalesRecords]);

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

  // for changing the name of tabs
  const sections = [
    { id: 'inventory', label: 'Inventory', key: 'inventory' },
    { id: 'sales', label: 'Sales', key: 'sales' },
    { id: 'category', label: 'Categories', key: 'category' }, 
  ];

  // Stats
  const inventoryStats = useMemo(() => calculateStats(inventoryItems), [inventoryItems]);

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

  // Filter categories based on search term
  const filteredCategoryData = useMemo(() => {
    if (!categorySearchTerm) return categoryData;
    return categoryData.filter(category => 
      category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
  }, [categoryData, categorySearchTerm]);

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
  const handleAddSale = () => setIsAddSalesModalOpen(true);

  // Updated Sales Handlers
  const handleEditSale = (id: number) => {
    const sale = salesRecords.find(record => record.id === id);
    if (sale) {
      setEditingSale(sale);
      setIsEditSaleModalOpen(true);
    }
  };

  const handleDeleteSale = (id: number) => {
    if (window.confirm('Are you sure you want to delete this sale record?')) {
      setSalesRecords(prev => prev.filter(record => record.id !== id));
    }
  };

  const handleSaveSale = (updatedSale: SalesRecord) => {
    setSalesRecords(prev => 
      prev.map(record => 
        record.id === updatedSale.id ? updatedSale : record
      )
    );
    setIsEditSaleModalOpen(false);
    setEditingSale(null);
  };

  const handleAddNewSale = (saleData: {
    productName: string;
    quantity: number;
    price: number;
    paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Card';
    date: string;
  }) => {
    const newSale: SalesRecord = {
      id: Math.max(...salesRecords.map(s => s.id), 0) + 1,
      date: saleData.date,
      productName: saleData.productName,
      quantity: saleData.quantity,
      price: saleData.price,
      total: saleData.quantity * saleData.price,
      paymentMethod: saleData.paymentMethod,
    };
    
    setSalesRecords(prev => [...prev, newSale]);
    setIsAddSalesModalOpen(false);
  };

  const handleCloseSaleModal = () => {
    setIsEditSaleModalOpen(false);
    setEditingSale(null);
  };

  const handleSaveCategory = (categoryName: string, color: string) => setCategoryColors(prev => ({ ...prev, [categoryName]: color }));

  const handleViewProducts = (categoryName: string) => {
    handleSectionChange('inventory');
    setSelectedCategory(categoryName);
  };

  const handleAddProduct = (data: ProductFormData) => {
    const totalAmount = data.productPrice * data.quantity;
    const newProduct: InventoryItem = {
      id: Math.max(...inventoryItems.map(i => i.id), 0) + 1,
      productName: data.productName,
      category: data.category,
      stock: data.quantity,
      status: data.quantity === 0 ? 'Out Of Stock' : data.quantity <= 10 ? 'Low Stock' : 'In Stock',
      productPrice: data.productPrice,
      totalAmount,
    };
    setInventoryItems(prev => [...prev, newProduct]);
  };

  const handleSaveProduct = (updated: InventoryItem) => {
    const totalAmount = updated.stock * updated.productPrice;
    const finalItem = {
      ...updated,
      status: updated.stock === 0 ? 'Out Of Stock' : updated.stock <= 10 ? 'Low Stock' : 'In Stock',
      totalAmount,
    };
    setInventoryItems(prev => prev.map(i => (i.id === finalItem.id ? finalItem : i)));
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(undefined);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  // Handle section change - enhanced to properly notify parent
  const handleSectionChange = (section: string) => {
    setLocalActiveSection(section);
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  return (
    <div className="space-y-6">
      {/* Inventory Section - Now InventoryStats handles the MainLayoutCard */}
      {activeSection === 'inventory' && (
        <InventoryStats 
          stats={inventoryStats}
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
          setActiveSection={handleSectionChange}
          onAddCategory={handleAddCategory}
          sections={sections}
        >
          <InventoryTable 
            items={filteredItems}
            onViewItem={(id) => console.log('View item', id)}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredItems.length / 10)}
            filteredCount={filteredItems.length}
            totalCount={inventoryItems.length}
            onPageChange={handlePageChange}
          />
        </InventoryStats>
      )}

      {/* Category Section - Now fully handled by CategoryContent */}
      {activeSection === 'category' && (
        <CategoryContent 
          categories={filteredCategoryData}
          currentPage={currentPage}
          totalPages={Math.ceil(filteredCategoryData.length / 10)}
          filteredCount={filteredCategoryData.length}
          totalCount={categoryData.length}
          onPageChange={handlePageChange}
          onViewProducts={handleViewProducts}
          showHeaderStats={true}
          onAddCategory={handleAddCategory}
          searchQuery={categorySearchTerm}
          onSearchChange={setCategorySearchTerm}
          sections={sections}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          inventoryItems={inventoryItems}
        />
      )}

      {/* Sales Section - Now handled by SalesStats */}
      {activeSection === 'sales' && (
        <SalesStats 
          totalSales={salesStats.totalSales}
          totalAmount={salesStats.totalAmount}
          averageSale={salesStats.averageSale}
          totalItemsSold={salesStats.totalItemsSold}
          sections={sections}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          salesRecords={filteredSalesRecords}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onAddSale={handleAddSale}
          onEditSale={handleEditSale}
          onDeleteSale={handleDeleteSale}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}

      {/* All Modals */}
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
      
      {/* Edit Sales Modal */}
      <EditSaleModal
        isOpen={isEditSaleModalOpen}
        onClose={handleCloseSaleModal}
        sale={editingSale}
        onSave={handleSaveSale}
      />

      {/* Add Sales Modal */}
      <AddSalesModal
        isOpen={isAddSalesModalOpen}
        onClose={() => setIsAddSalesModalOpen(false)}
        onAddSale={handleAddNewSale}
      />
    </div>
  );
};

export default Inventory;
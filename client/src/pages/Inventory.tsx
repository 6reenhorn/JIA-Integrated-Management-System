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
  // Search states for each section
  const [searchTerm, setSearchTerm] = useState('');
  const [salesSearchTerm, setSalesSearchTerm] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  
  // UI states - SEPARATE PAGE STATE FOR EACH SECTION
  const [filterOpen, setFilterOpen] = useState(false);
  const [inventoryCurrentPage, setInventoryCurrentPage] = useState(1);
  const [salesCurrentPage, setSalesCurrentPage] = useState(1);
  const [categoryCurrentPage, setCategoryCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Modal states
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

  // Sales records state - Empty initially
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);

  // Filter sales records by date and search term
  const filteredSalesRecords = useMemo(() => {
    let filtered = salesRecords;
    
    // Filter by date if a date is selected
    if (selectedDate) {
      filtered = filtered.filter(record => record.date === selectedDate);
    }
    
    // Filter by search term (searches product name)
    if (salesSearchTerm) {
      filtered = filtered.filter(record => 
        record.productName.toLowerCase().includes(salesSearchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [salesRecords, selectedDate, salesSearchTerm]);

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

  // Categories state - Empty initially
  const [allCategories, setAllCategories] = useState<string[]>([]);

  // Category colors - Empty initially
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});

  // Inventory data - Empty initially
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

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

  // Use allCategories
  const categories = allCategories;

  const categoryData = useMemo(() => {
    const map = new Map();
    
    // Initialize all categories with zero counts
    allCategories.forEach(categoryName => {
      map.set(categoryName, {
        name: categoryName,
        productCount: 0,
        totalStock: 0,
        totalValue: 0,
        color: categoryColors[categoryName] || '#6B7280',
      });
    });
    
    // Update with actual inventory data
    inventoryItems.forEach(item => {
      if (map.has(item.category)) {
        const category = map.get(item.category);
        category.productCount++;
        category.totalStock += item.stock;
        category.totalValue += item.totalAmount;
      }
    });
    
    return Array.from(map.values());
  }, [inventoryItems, categoryColors, allCategories]);

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

  // REMOVED window.confirm - Delete happens immediately
  const handleDeleteItem = (id: number) => {
    setInventoryItems(prev => {
      const filtered = prev.filter(i => i.id !== id);
      // Reset to page 1 if current page is now empty
      const totalPages = Math.ceil(filtered.length / 10);
      if (inventoryCurrentPage > totalPages && totalPages > 0) {
        setInventoryCurrentPage(totalPages);
      } else if (filtered.length === 0) {
        setInventoryCurrentPage(1);
      }
      return filtered;
    });
  };

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

  // REMOVED window.confirm - Delete happens immediately
  const handleDeleteSale = (id: number) => {
    setSalesRecords(prev => {
      const filtered = prev.filter(record => record.id !== id);
      // Reset to page 1 if current page is now empty
      const totalPages = Math.ceil(filtered.length / 10);
      if (salesCurrentPage > totalPages && totalPages > 0) {
        setSalesCurrentPage(totalPages);
      } else if (filtered.length === 0) {
        setSalesCurrentPage(1);
      }
      return filtered;
    });
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
    // Reset to page 1 after adding
    setSalesCurrentPage(1);
    setIsAddSalesModalOpen(false);
  };

  const handleCloseSaleModal = () => {
    setIsEditSaleModalOpen(false);
    setEditingSale(null);
  };

  // Update both categoryColors and allCategories
  const handleSaveCategory = (categoryName: string, color: string) => {
    // Add to categories list if not already present
    if (!allCategories.includes(categoryName)) {
      setAllCategories(prev => [...prev, categoryName]);
    }
    // Add/update color
    setCategoryColors(prev => ({ ...prev, [categoryName]: color }));
    // Reset to page 1 after adding
    setCategoryCurrentPage(1);
    // Close modal after saving
    setIsAddCategoryModalOpen(false);
  };

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
    // Reset to page 1 after adding
    setInventoryCurrentPage(1);
    // Close modal after adding
    setIsAddModalOpen(false);
  };

  const handleSaveProduct = (updated: InventoryItem) => {
    const totalAmount = updated.stock * updated.productPrice;
    const finalItem = {
      ...updated,
      status: updated.stock === 0 ? 'Out Of Stock' : updated.stock <= 10 ? 'Low Stock' : 'In Stock',
      totalAmount,
    };
    setInventoryItems(prev => prev.map(i => (i.id === finalItem.id ? finalItem : i)));
    // Close modal and reset editing item
    setIsEditModalOpen(false);
    setEditingItem(undefined);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(undefined);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCloseCategoryModal = () => {
    setIsAddCategoryModalOpen(false);
  };

  const handleCloseSalesModal = () => {
    setIsAddSalesModalOpen(false);
  };

  // Separate page change handlers for each section
  const handleInventoryPageChange = (page: number) => setInventoryCurrentPage(page);
  const handleSalesPageChange = (page: number) => setSalesCurrentPage(page);
  const handleCategoryPageChange = (page: number) => setCategoryCurrentPage(page);

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
            currentPage={inventoryCurrentPage}
            filteredCount={filteredItems.length}
            totalCount={inventoryItems.length}
            onPageChange={handleInventoryPageChange}
          />
        </InventoryStats>
      )}

      {/* Category Section - Now fully handled by CategoryContent */}
      {activeSection === 'category' && (
        <CategoryContent 
          categories={filteredCategoryData}
          currentPage={categoryCurrentPage}
          totalPages={Math.ceil(filteredCategoryData.length / 10)}
          filteredCount={filteredCategoryData.length}
          totalCount={categoryData.length}
          onPageChange={handleCategoryPageChange}
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
          searchTerm={salesSearchTerm}
          setSearchTerm={setSalesSearchTerm}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onAddSale={handleAddSale}
          onEditSale={handleEditSale}
          onDeleteSale={handleDeleteSale}
          currentPage={salesCurrentPage}
          onPageChange={handleSalesPageChange}
        />
      )}

      {/* All Modals */}
      <AddProductModal 
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
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
        onClose={handleCloseCategoryModal}
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
        onClose={handleCloseSalesModal}
        onAddSale={handleAddNewSale}
      />
    </div>
  );
};

export default Inventory;
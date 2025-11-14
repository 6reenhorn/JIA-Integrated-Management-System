import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
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

export type SalesRecord = {
  id: number;
  date: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay';
};

type Category = {
  id: number;
  name: string;
  color: string;
  createdAt: string;
};

interface InventoryProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ activeSection: propActiveSection, onSectionChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [salesSearchTerm, setSalesSearchTerm] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [isLoadingSales, setIsLoadingSales] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  
  const [filterOpen, setFilterOpen] = useState(false);
  const [inventoryCurrentPage, setInventoryCurrentPage] = useState(1);
  const [salesCurrentPage, setSalesCurrentPage] = useState(1);
  const [categoryCurrentPage, setCategoryCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddSalesModalOpen, setIsAddSalesModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  
  const [isEditSaleModalOpen, setIsEditSaleModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<SalesRecord | null>(null);
  const [isUpdatingSale, setIsUpdatingSale] = useState(false);
  
  const [localActiveSection, setLocalActiveSection] = useState('inventory');
  const activeSection = propActiveSection || localActiveSection;

  useEffect(() => {
    if (onSectionChange && propActiveSection === undefined) {
      onSectionChange(activeSection);
    }
  }, [activeSection, onSectionChange, propActiveSection]);

  useEffect(() => {
    if (propActiveSection && propActiveSection !== activeSection) {
      setLocalActiveSection(propActiveSection);
    }
  }, [propActiveSection, activeSection]);

  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await axios.get('http://localhost:3001/api/inventory/categories');
        setCategoriesData(response.data);
      } catch (err: unknown) {
        console.error('Error fetching categories:', err);
        if (axios.isAxiosError(err)) {
          console.error('Error details:', err.response?.data);
        } else if (err instanceof Error) {
          console.error('Error message:', err.message);
        } else {
          console.error('Error details:', String(err));
        }
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      setIsLoadingInventory(true);
      try {
        const response = await axios.get('http://localhost:3001/api/inventory');
        setInventoryItems(response.data);
      } catch (err: unknown) {
        console.error('Error fetching inventory items:', err);
        if (axios.isAxiosError(err)) {
          console.error('Error details:', err.response?.data);
        } else if (err instanceof Error) {
          console.error('Error message:', err.message);
        } else {
          console.error('Error details:', String(err));
        }
      } finally {
        setIsLoadingInventory(false);
      }
    };
    fetchInventoryItems();
  }, []);

  useEffect(() => {
    const fetchSalesRecords = async () => {
      setIsLoadingSales(true);
      try {
        const response = await axios.get('http://localhost:3001/api/inventory/sales');
        setSalesRecords(response.data);
      } catch (err: unknown) {
        console.error('Error fetching sales records:', err);
        if (axios.isAxiosError(err)) {
          console.error('Error details:', err.response?.data);
        } else if (err instanceof Error) {
          console.error('Error message:', err.message);
        } else {
          console.error('Error details:', String(err));
        }
      } finally {
        setIsLoadingSales(false);
      }
    };
    fetchSalesRecords();
  }, []);

  const allCategories = useMemo(() => 
    categoriesData.map(cat => cat.name), 
    [categoriesData]
  );

  const categoryColors = useMemo(() => {
    const colors: Record<string, string> = {};
    categoriesData.forEach(cat => {
      colors[cat.name] = cat.color;
    });
    return colors;
  }, [categoriesData]);

  const filteredSalesRecords = useMemo(() => {
    let filtered = salesRecords;
    
    if (selectedDate) {
      filtered = filtered.filter(record => record.date === selectedDate);
    }
    
    if (salesSearchTerm) {
      filtered = filtered.filter(record => 
        record.productName.toLowerCase().includes(salesSearchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [salesRecords, selectedDate, salesSearchTerm]);

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

  const sections = [
    { id: 'inventory', label: 'Inventory', key: 'inventory' },
    { id: 'sales', label: 'Sales', key: 'sales' },
    { id: 'category', label: 'Categories', key: 'category' }, 
  ];

  const inventoryStats = useMemo(() => calculateStats(inventoryItems), [inventoryItems]);

  const filteredItems = useMemo(
    () => filterInventoryItems(inventoryItems, searchTerm, selectedCategory),
    [inventoryItems, searchTerm, selectedCategory]
  );

  const categories = allCategories;

  const categoryData = useMemo(() => {
    const map = new Map();
    
    allCategories.forEach(categoryName => {
      map.set(categoryName, {
        name: categoryName,
        productCount: 0,
        totalStock: 0,
        totalValue: 0,
        color: categoryColors[categoryName] || '#6B7280',
      });
    });
    
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

  const filteredCategoryData = useMemo(() => {
    if (!categorySearchTerm) return categoryData;
    return categoryData.filter(category => 
      category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
  }, [categoryData, categorySearchTerm]);

  const handleEditItem = (id: number) => {
    const item = inventoryItems.find(i => i.id === id);
    if (item) {
      setEditingItem(item);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/inventory/${id}`);
      
      setInventoryItems(prev => {
        const filtered = prev.filter(i => i.id !== id);
        const totalPages = Math.ceil(filtered.length / 10);
        if (inventoryCurrentPage > totalPages && totalPages > 0) {
          setInventoryCurrentPage(totalPages);
        } else if (filtered.length === 0) {
          setInventoryCurrentPage(1);
        }
        return filtered;
      });
      
      console.log('Inventory item deleted successfully');
    } catch (err: unknown) {
      console.error('Error deleting inventory item:', err);
      if (axios.isAxiosError(err)) {
        console.error('Error details:', err.response?.data);
      } else if (err instanceof Error) {
        console.error('Error message:', err.message);
      } else {
        console.error('Error details:', String(err));
      }
      let errorMessage = 'Unknown error';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.error || err.message || String(err);
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = String(err);
      }
      alert(`Failed to delete item: ${errorMessage}`);
    }
  };

  const handleAddItem = () => setIsAddModalOpen(true);

  const handleAddProduct = async (data: ProductFormData) => {
    try {
      console.log('Adding product:', data);
      
      const response = await axios.post('http://localhost:3001/api/inventory', {
        productName: data.productName,
        category: data.category,
        stock: data.quantity,
        productPrice: data.productPrice,
        description: data.description,
        minimumStock: data.minimumStock,
      });
      
      console.log('Product added:', response.data);
      setInventoryItems(prev => [...prev, response.data]);
      setInventoryCurrentPage(1);
      setIsAddModalOpen(false);
    } catch (err: unknown) {
      console.error('Error adding product:', err);
      if (axios.isAxiosError(err)) {
        console.error('Error details:', err.response?.data);
      } else if (err instanceof Error) {
        console.error('Error message:', err.message);
      } else {
        console.error('Error details:', String(err));
      }
      let errorMessage = 'Unknown error';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || String(err);
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = String(err);
      }
      alert(`Failed to add product: ${errorMessage}\n\nPlease check the console for more details.`);
    }
  };

  const handleSaveProduct = async (updated: InventoryItem) => {
    setIsUpdatingProduct(true);
    try {
      console.log('Updating product:', updated);
      
      const response = await axios.put(`http://localhost:3001/api/inventory/${updated.id}`, {
        productName: updated.productName,
        category: updated.category,
        stock: updated.stock,
        productPrice: updated.productPrice,
        description: updated.description,
        minimumStock: updated.minimumStock,
      });
      
      console.log('Product updated:', response.data);
      setInventoryItems(prev => prev.map(i => (i.id === response.data.id ? response.data : i)));
      setIsEditModalOpen(false);
      setEditingItem(undefined);
    } catch (err: unknown) {
      console.error('Error updating product:', err);
      if (axios.isAxiosError(err)) {
        console.error('Error details:', err.response?.data);
      } else if (err instanceof Error) {
        console.error('Error message:', err.message);
      } else {
        console.error('Error details:', String(err));
      }
      let errorMessage = 'Unknown error';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || String(err);
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = String(err);
      }
      alert(`Failed to update product: ${errorMessage}\n\nPlease check the console for more details.`);
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(undefined);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddCategory = () => setIsAddCategoryModalOpen(true);

  const handleSaveCategory = async (categoryName: string, color: string) => {
    try {
      console.log('Adding category:', { categoryName, color });
      
      const response = await axios.post('http://localhost:3001/api/inventory/categories', {
        name: categoryName,
        color: color,
      });
      
      console.log('Category added:', response.data);
      setCategoriesData(prev => [...prev, response.data]);
      setCategoryCurrentPage(1);
      setIsAddCategoryModalOpen(false);
    } catch (err: unknown) {
      console.error('Error adding category:', err);
      if (axios.isAxiosError(err)) {
        console.error('Error details:', err.response?.data);
      } else if (err instanceof Error) {
        console.error('Error message:', err.message);
      } else {
        console.error('Error details:', String(err));
      }
      let errorMessage = 'Unknown error';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || String(err);
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = String(err);
      }
      alert(`Failed to add category: ${errorMessage}`);
    }
  };

  const handleCloseCategoryModal = () => {
    setIsAddCategoryModalOpen(false);
  };

  const handleViewProducts = (categoryName: string) => {
    handleSectionChange('inventory');
    setSelectedCategory(categoryName);
  };

  const handleAddSale = () => setIsAddSalesModalOpen(true);

  const handleEditSale = (id: number) => {
    const sale = salesRecords.find(record => record.id === id);
    if (sale) {
      setEditingSale(sale);
      setIsEditSaleModalOpen(true);
    }
  };

  const handleDeleteSale = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/inventory/sales/${id}`);
      
      setSalesRecords(prev => {
        const filtered = prev.filter(record => record.id !== id);
        const totalPages = Math.ceil(filtered.length / 10);
        if (salesCurrentPage > totalPages && totalPages > 0) {
          setSalesCurrentPage(totalPages);
        } else if (filtered.length === 0) {
          setSalesCurrentPage(1);
        }
        return filtered;
      });
      
      console.log('Sales record deleted successfully');
    } catch (err: unknown) {
      console.error('Error deleting sales record:', err);
      if (axios.isAxiosError(err)) {
        console.error('Error details:', err.response?.data);
      } else if (err instanceof Error) {
        console.error('Error message:', err.message);
      } else {
        console.error('Error details:', String(err));
      }
      let errorMessage = 'Unknown error';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.error || err.message || String(err);
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = String(err);
      }
      alert(`Failed to delete sale: ${errorMessage}`);
    }
  };

  const handleSaveSale = async (updatedSale: SalesRecord) => {
    setIsUpdatingSale(true);
    try {
      console.log('Updating sale:', updatedSale);
      
      const response = await axios.put(`http://localhost:3001/api/inventory/sales/${updatedSale.id}`, {
        date: updatedSale.date,
        productName: updatedSale.productName,
        quantity: updatedSale.quantity,
        price: updatedSale.price,
        paymentMethod: updatedSale.paymentMethod,
      });
      
      console.log('Sale updated:', response.data);
      setSalesRecords(prev => 
        prev.map(record => 
          record.id === response.data.id ? response.data : record
        )
      );
      setIsEditSaleModalOpen(false);
      setEditingSale(null);
    } catch (err: unknown) {
      console.error('Error updating sales record:', err);
      if (axios.isAxiosError(err)) {
        console.error('Error details:', err.response?.data);
      } else if (err instanceof Error) {
        console.error('Error message:', err.message);
      } else {
        console.error('Error details:', String(err));
      }
      let errorMessage = 'Unknown error';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || String(err);
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = String(err);
      }
      alert(`Failed to update sale: ${errorMessage}\n\nPlease check the console for more details.`);
    } finally {
      setIsUpdatingSale(false);
    }
  };

  const handleAddNewSale = async (saleData: {
    productName: string;
    quantity: number;
    price: number;
    paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay';
    date: string;
  }) => {
    try {
      console.log('Adding sale:', saleData);
      
      const response = await axios.post('http://localhost:3001/api/inventory/sales', {
        date: saleData.date,
        productName: saleData.productName,
        quantity: saleData.quantity,
        price: saleData.price,
        paymentMethod: saleData.paymentMethod,
      });
      
      console.log('Sale added:', response.data);
      setSalesRecords(prev => [...prev, response.data]);
      setSalesCurrentPage(1);
      setIsAddSalesModalOpen(false);
    } catch (err: unknown) {
      console.error('Error adding sales record:', err);
      if (axios.isAxiosError(err)) {
        console.error('Error details:', err.response?.data);
      } else if (err instanceof Error) {
        console.error('Error message:', err.message);
      } else {
        console.error('Error details:', String(err));
      }
      let errorMessage = 'Unknown error';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || String(err);
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = String(err);
      }
      alert(`Failed to add sale: ${errorMessage}\n\nPlease check the console for more details.`);
    }
  };

  const handleCloseSaleModal = () => {
    setIsEditSaleModalOpen(false);
    setEditingSale(null);
  };

  const handleCloseSalesModal = () => {
    setIsAddSalesModalOpen(false);
  };

  const handleInventoryPageChange = (page: number) => setInventoryCurrentPage(page);
  const handleSalesPageChange = (page: number) => setSalesCurrentPage(page);
  const handleCategoryPageChange = (page: number) => setCategoryCurrentPage(page);

  const handleSectionChange = (section: string) => {
    setLocalActiveSection(section);
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  return (
    <div className="space-y-6">
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
            isLoading={isLoadingInventory}
          />
        </InventoryStats>
      )}

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
          isLoading={isLoadingCategories}
        />
      )}

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
          isLoading={isLoadingSales}
        />
      )}

      <AddProductModal 
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onAddProduct={handleAddProduct}
        categories={categories}
        categoryColors={categoryColors}
      />
      <EditProductModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveProduct}
        initialData={editingItem}
        categories={categories}
        categoryColors={categoryColors}
        isUpdating={isUpdatingProduct}
      />
      <AddCategoryModal 
        isOpen={isAddCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        onAddCategory={handleSaveCategory}
      />
      
      <EditSaleModal
        isOpen={isEditSaleModalOpen}
        onClose={handleCloseSaleModal}
        sale={editingSale}
        onSave={handleSaveSale}
        isUpdating={isUpdatingSale}
      />

      <AddSalesModal
        isOpen={isAddSalesModalOpen}
        onClose={handleCloseSalesModal}
        onAddSale={handleAddNewSale}
      />
    </div>
  );
};

export default Inventory;
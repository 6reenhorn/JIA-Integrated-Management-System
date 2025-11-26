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

// Helper function to normalize date formats
const normalizeDateFormat = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // Create date object and format it in local timezone
    const date = new Date(dateString);
    
    // Get year, month, day in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error normalizing date:', error);
    return '';
  }
};

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

  const [isAddingSales, setIsAddingSales] = useState(false);
  const [isDeletingSales, setIsDeletingSales] = useState(false);
  const [isAddingInventory, setIsAddingInventory] = useState(false);
  const [isDeletingInventory, setIsDeletingInventory] = useState(false);

  const [isRefreshingInventory, setIsRefreshingInventory] = useState(false);
  const [isRefreshingSales, setIsRefreshingSales] = useState(false);
  const [isRefreshingCategories, setIsRefreshingCategories] = useState(false);

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

  useEffect(() => {
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

  // Calculate out of stock items
  const outOfStockItems = useMemo(() => 
    inventoryItems.filter(item => item.stock === 0),
    [inventoryItems]
  );

  // Calculate low stock items (you can define what "low stock" means, e.g., stock <= minimumStock or stock <= 5)
  const lowStockItems = useMemo(() => 
    inventoryItems.filter(item => item.stock > 0 && item.stock <= (item.minimumStock || 5)),
    [inventoryItems]
  );

  const filteredSalesRecords = useMemo(() => {
    console.log('Filtering sales records - Total:', salesRecords.length, 'Selected Date:', selectedDate, 'Search Term:', salesSearchTerm);
    
    let filtered = salesRecords;
    
    if (selectedDate) {
      // Normalize the selected date
      const normalizedSelectedDate = normalizeDateFormat(selectedDate);
      console.log('Normalized selected date:', normalizedSelectedDate);
      
      filtered = filtered.filter(record => {
        const normalizedRecordDate = normalizeDateFormat(record.date);
        console.log('Comparing:', normalizedRecordDate, '===', normalizedSelectedDate);
        return normalizedRecordDate === normalizedSelectedDate;
      });
      console.log('After date filter:', filtered.length);
    }
    
    if (salesSearchTerm) {
      filtered = filtered.filter(record => 
        record.productName.toLowerCase().includes(salesSearchTerm.toLowerCase())
      );
      console.log('After search filter:', filtered.length);
    }
    
    console.log('Final filtered count:', filtered.length);
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

  // Update inventory stats to include out of stock and low stock counts
  const enhancedInventoryStats = useMemo(() => ({
    ...inventoryStats,
    outOfStockItems: outOfStockItems.length,
    lowStockItems: lowStockItems.length
  }), [inventoryStats, outOfStockItems.length, lowStockItems.length]);

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
    setIsDeletingInventory(true);
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
    } finally {
      setIsDeletingInventory(false);  
    }
  };

  const handleAddItem = () => setIsAddModalOpen(true);

  const handleAddProduct = async (data: ProductFormData) => {
    setIsAddModalOpen(false);
    setIsAddingInventory(true);
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
    } finally {
      setIsAddingInventory(false);
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

const handleDeleteCategory = async (categoryName: string) => {
  try {
    console.log('Deleting category:', categoryName);
    
    await axios.delete(`http://localhost:3001/api/inventory/categories/${encodeURIComponent(categoryName)}`);
    
    console.log('Category deleted successfully');
    
    // Remove the category from state
    setCategoriesData(prev => prev.filter(cat => cat.name !== categoryName));
    
    // Reset to first page if needed
    const remainingCategories = categoriesData.filter(cat => cat.name !== categoryName);
    const totalPages = Math.ceil(remainingCategories.length / 9);
    if (categoryCurrentPage > totalPages && totalPages > 0) {
      setCategoryCurrentPage(totalPages);
    } else if (remainingCategories.length === 0) {
      setCategoryCurrentPage(1);
    }
    
    // If the deleted category was selected in the filter, reset to 'all'
    if (selectedCategory === categoryName) {
      setSelectedCategory('all');
    }
    
  } catch (err: unknown) {
    console.error('Error deleting category:', err);
    if (axios.isAxiosError(err)) {
      console.error('Error details:', err.response?.data);
    } else if (err instanceof Error) {
      console.error('Error message:', err.message);
    } else {
      console.error('Error details:', String(err));
    }
    
    // Just re-throw the error - CategoryContent will handle displaying it
    throw err;
  }
};

const handleEditCategory = async (oldName: string, newName: string, color: string) => {
  try {
    console.log('Editing category:', { oldName, newName, color });
    
    const response = await axios.put(
      `http://localhost:3001/api/inventory/categories/${encodeURIComponent(oldName)}`,
      {
        name: newName,
        color: color,
      }
    );
    
    console.log('Category updated:', response.data);
    
    // Update the categories in state
    setCategoriesData(prev => 
      prev.map(cat => 
        cat.name === oldName 
          ? { ...cat, name: newName, color: color }
          : cat
      )
    );
    
    // If the edited category was selected in filter, update the selection
    if (selectedCategory === oldName) {
      setSelectedCategory(newName);
    }
    
  } catch (err: unknown) {
    console.error('Error editing category:', err);
    if (axios.isAxiosError(err)) {
      console.error('Error details:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error message:', err.message);
      // THIS IS THE KEY - Log the full response
      console.error('Full error response:', JSON.stringify(err.response?.data, null, 2));
    } else if (err instanceof Error) {
      console.error('Error message:', err.message);
    } else {
      console.error('Error details:', String(err));
    }
    
    // Re-throw the error so CategoryContent can handle it
    throw err;
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

  const handleRefreshInventory = async () => {
    console.log('Refresh button clicked');
    console.log('Current inventory items:', inventoryItems.length);
    setIsRefreshingInventory(true);
    setIsLoadingInventory(true);
    try {
      const response = await axios.get('http://localhost:3001/api/inventory');
      console.log('Fetched inventory data:', response.data);
      console.log('New inventory items count:', response.data.length);
      setInventoryItems(response.data);
      console.log('State updated');
    } catch (err: unknown) {
      console.error('Error refreshing inventory data:', err);
      if (axios.isAxiosError(err)) {
        console.error('Error details:', err.response?.data);
      } else if (err instanceof Error) {
        console.error('Error message:', err.message);
      } else {
        console.error('Error details:', String(err));
      }
    } finally {
      setTimeout(() => {
        setIsRefreshingInventory(false);
        setIsLoadingInventory(false);
        console.log('Refresh complete');
      }, 500);
    }
  };

  const handleRefreshSales = async () => {
    console.log('Refresh button clicked');
    console.log('Current sales records:', salesRecords.length);
    setIsRefreshingSales(true);
    setIsLoadingSales(true);
    try {
      const response = await axios.get('http://localhost:3001/api/inventory/sales');
      console.log('Fetched sales data:', response.data);
      console.log('New sales records count:', response.data.length);
      setSalesRecords(response.data);
      console.log('State updated');
    } catch (err: unknown) {
      console.error('Error refreshing sales data:', err);
      if (axios.isAxiosError(err)) {
        console.error('Error details:', err.response?.data);
      } else if (err instanceof Error) {
        console.error('Error message:', err.message);
      } else {
        console.error('Error details:', String(err));
      }
    } finally {
      setTimeout(() => {
        setIsRefreshingSales(false);
        setIsLoadingSales(false);
        console.log('Refresh complete');
      }, 500);
    }
  };

  const handleRefreshCategories = async () => {
    console.log('Refresh button clicked');
    console.log('Current categories:', categoriesData.length);
    setIsRefreshingCategories(true);
    setIsLoadingCategories(true);
    try {
      const response = await axios.get('http://localhost:3001/api/inventory/categories');
      console.log('Fetched categories data:', response.data);
      console.log('New categories count:', response.data.length);
      setCategoriesData(response.data);
      console.log('State updated');
    } catch (err: unknown) {
      console.error('Error refreshing categories data:', err);
      if (axios.isAxiosError(err)) {
        console.error('Error details:', err.response?.data);
      } else if (err instanceof Error) {
        console.error('Error message:', err.message);
      } else {
        console.error('Error details:', String(err));
      }
    } finally {
      setTimeout(() => {
        setIsRefreshingCategories(false);
        setIsLoadingCategories(false);
        console.log('Refresh complete');
      }, 500);
    }
  };

  const handleDeleteSale = async (id: number) => {
    setIsDeletingSales(true);
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
    } finally {
      setIsDeletingSales(false);  
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

  // ADD THIS FUNCTION BACK - IT WAS MISSING
  const handleAddNewSale = async (saleData: {
    productName: string;
    quantity: number;
    price: number;
    paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay';
    date: string;
  }) => {
    setIsAddSalesModalOpen(false);
    setIsAddingSales(true);
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
      
      // Automatically refresh inventory after adding sale
      await fetchInventoryItems();
      
    } catch (err: unknown) {
      console.error('Error adding sales record:', err);
      
      // Re-open the modal if there's a stock conflict so user can adjust
      setIsAddSalesModalOpen(true);
      
      let errorMessage = 'Unknown error';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || String(err);
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = String(err);
      }
      
      // Show more specific error message for stock issues
      if (errorMessage.includes('Insufficient stock') || errorMessage.includes('Available:')) {
        alert(`Stock conflict: ${errorMessage}\n\nPlease adjust the quantity and try again.`);
      } else if (errorMessage.includes('not found in inventory')) {
        alert(`Product not found: ${errorMessage}\n\nPlease add the product to inventory first.`);
      } else {
        alert(`Failed to add sale: ${errorMessage}\n\nPlease check the console for more details.`);
      }
      
      // Re-throw the error to stop the process
      throw err;
    } finally {
      setIsAddingSales(false);  
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
          stats={enhancedInventoryStats} // Use enhanced stats that include out of stock count
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
          onRefresh={handleRefreshInventory}
          isRefreshing={isRefreshingInventory}
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
            isAdding={isAddingInventory}
            isDeletingRecord={isDeletingInventory}
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
          onDeleteCategory={handleDeleteCategory}
          onEditCategory={handleEditCategory} 
          searchQuery={categorySearchTerm}
          onSearchChange={setCategorySearchTerm}
          sections={sections}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          inventoryItems={inventoryItems}
          isLoading={isLoadingCategories}
          onRefresh={handleRefreshCategories}
          isRefreshing={isRefreshingCategories}
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
          isAdding={isAddingSales}
          isDeleting={isDeletingSales}
          onRefreshSales={handleRefreshSales}
          isRefreshingSales={isRefreshingSales}
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
        onInventoryUpdate={fetchInventoryItems} 
      />
    </div>
  );
};

export default Inventory;
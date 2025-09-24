import type { InventoryItem, InventoryStats } from '../types/inventory_types';

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'in stock':
      return 'bg-green-100 text-green-800';
    case 'low stock':
      return 'bg-yellow-100 text-yellow-800';
    case 'out of stock':
      return 'bg-red-100 text-red-800';
    case 'good':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const filterInventoryItems = (
  items: InventoryItem[],
  searchTerm: string,
  category: string
): InventoryItem[] => {
  return items.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || item.category === category;
    return matchesSearch && matchesCategory;
  });
};

export const calculateStats = (items: InventoryItem[]): InventoryStats => {
  // Calculate total inventory value (price * quantity for each item)
  const inventoryValue = items.reduce((total, item) => {
    return total + (item.productPrice * item.quantity);
  }, 0);

  return {
    totalItems: items.length,
    inventoryValue: Math.round(inventoryValue * 100) / 100, // Round to 2 decimal places
    lowStockItems: items.filter(item => item.status === 'Low Stock').length,
    expiredItems: items.filter(item => item.status === 'Expired').length,
    outOfStockItems: items.filter(item => item.status === 'Out Of Stock').length,
  };
};
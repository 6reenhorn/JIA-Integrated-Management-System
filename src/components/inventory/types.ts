export interface InventoryItem {
  id: number;
  productName: string;
  category: string;
  storageLocation: string;
  status: 'Good' | 'Low Stock' | 'Out Of Stock' | 'Expired';
  productPrice: number;
  quantity?: number;
}

export interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  expiredItems: number;
  outOfStockItems: number;
}
// types/inventory_types.ts
export interface InventoryItem {
  id: number;
  productName: string;
  category: string;
  stock: number;
  status: string;
  productPrice: number;
  totalAmount: number;
}

// ProductFormData interface
export interface ProductFormData {
  productName: string;
  description?: string;
  category: string;
  productPrice: number;
  quantity: number; 
  minimumStock?: number;
  status?: string; 
}

// Add the missing InventoryStats interface
export interface InventoryStats {
  totalItems: number;
  inventoryValue?: number;
  lowStockItems: number;
  expiredItems: number;
  outOfStockItems: number;
}
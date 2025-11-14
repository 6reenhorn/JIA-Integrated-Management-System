// types/inventory_types.ts

export interface InventoryItem {
  id: number;
  productName: string;
  category: string;
  stock: number;
  status: 'Good' | 'Low Stock' | 'Out Of Stock' | 'In Stock' | string;
  productPrice: number;
  totalAmount: number;
  description?: string;
  minimumStock?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductFormData {
  productName: string;
  category: string;
  productPrice: number;
  quantity: number;
  minimumStock: number;
  description?: string;
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
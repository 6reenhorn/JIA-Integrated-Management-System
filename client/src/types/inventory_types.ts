// types/inventory_types.ts
export interface InventoryItem {
  id: number;
  productName: string;
  category: string;
  storageLocation: string;
  status: string;
  productPrice: number;
  quantity: number;
}

// Add this new interface for the product form
export interface ProductFormData {
  productName: string;
  description?: string; // <-- Add this line if missing
  category: string;
  storageLocation: string;
  productPrice: number;
  quantity: number;
  minimumStock?: number;
}

// Add the missing InventoryStats interface
export interface InventoryStats {
  totalItems: number;
  inventoryValue?: number; // Make optional temporarily
  lowStockItems: number;
  expiredItems: number;
  outOfStockItems: number;
}
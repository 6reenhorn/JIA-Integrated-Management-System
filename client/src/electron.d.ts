declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      onOnline: () => void;
      onOffline: () => void;
      manualSync: () => Promise<{ success: boolean; message: string }>;
      isOnline: () => boolean;
      getEmployees: () => Promise<any[]>;
      getAttendance: () => Promise<any[]>;
      getPayroll: () => Promise<any[]>;
      addEmployee: (employee: any) => Promise<any>;
      updateEmployee: (employee: any) => Promise<any>;
      deleteEmployee: (id: number) => Promise<{ success: boolean }>;

      // Inventory
      getInventoryItems: () => Promise<any[]>;
      addInventoryItem: (item: any) => Promise<any>;
      updateInventoryItem: (item: any) => Promise<any>;
      deleteInventoryItem: (id: number) => Promise<{ success: boolean }>;

      // Categories
      getCategories: () => Promise<any[]>;
      addCategory: (category: any) => Promise<any>;
      updateCategory: (payload: any) => Promise<any>;
      deleteCategory: (name: string) => Promise<{ success: boolean }>;

      // Sales
      getSales: () => Promise<any[]>;
      addSale: (sale: any) => Promise<any>;
      updateSale: (sale: any) => Promise<any>;
      deleteSale: (id: number) => Promise<{ success: boolean }>;

      // Attendance actions
      attendanceCheckIn: (payload: any) => Promise<any>;
      attendanceCheckOut: (payload: any) => Promise<{ success: boolean }>;

      // Payroll mutations
      addPayrollRecord: (payload: any) => Promise<any>;
      updatePayrollRecord: (payload: any) => Promise<any>;
      deletePayrollRecord: (id: number) => Promise<{ success: boolean }>;

      // E-Wallet
      getGCashRecords: () => Promise<any[]>;
      addGCashRecord: (record: any) => Promise<any>;
      updateGCashRecord: (record: any) => Promise<any>;
      deleteGCashRecord: (id: number) => Promise<{ success: boolean }>;

      getPayMayaRecords: () => Promise<any[]>;
      addPayMayaRecord: (record: any) => Promise<any>;
      updatePayMayaRecord: (record: any) => Promise<any>;
      deletePayMayaRecord: (id: number) => Promise<{ success: boolean }>;

      getJuanPayRecords: () => Promise<any[]>;
      addJuanPayRecord: (record: any) => Promise<any>;
      updateJuanPayRecord: (record: any) => Promise<any>;
      deleteJuanPayRecord: (id: number) => Promise<{ success: boolean }>;
    };
  }
}

export {};
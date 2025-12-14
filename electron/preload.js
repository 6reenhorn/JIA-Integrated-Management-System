const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // Online/Offline detection
  onOnline: () => ipcRenderer.send('online'),
  onOffline: () => ipcRenderer.send('offline'),
  
  // Manual sync trigger
  manualSync: () => ipcRenderer.invoke('manual-sync'),
  
  // Check current network status
  isOnline: () => navigator.onLine,

  // Data API
  getEmployees: () => ipcRenderer.invoke('data:get-employees'),
  getAttendance: () => ipcRenderer.invoke('data:get-attendance'),
  getPayroll: () => ipcRenderer.invoke('data:get-payroll'),
  addEmployee: (employee) => ipcRenderer.invoke('data:add-employee', employee),
  updateEmployee: (employee) => ipcRenderer.invoke('data:update-employee', employee),
  deleteEmployee: (id) => ipcRenderer.invoke('data:delete-employee', id)

  // Inventory
  ,getInventoryItems: () => ipcRenderer.invoke('inventory:get-items')
  ,addInventoryItem: (item) => ipcRenderer.invoke('inventory:add-item', item)
  ,updateInventoryItem: (item) => ipcRenderer.invoke('inventory:update-item', item)
  ,deleteInventoryItem: (id) => ipcRenderer.invoke('inventory:delete-item', id)

  // Categories
  ,getCategories: () => ipcRenderer.invoke('inventory:get-categories')
  ,addCategory: (category) => ipcRenderer.invoke('inventory:add-category', category)
  ,updateCategory: (payload) => ipcRenderer.invoke('inventory:update-category', payload)
  ,deleteCategory: (name) => ipcRenderer.invoke('inventory:delete-category', name)

  // Sales
  ,getSales: () => ipcRenderer.invoke('inventory:get-sales')
  ,addSale: (sale) => ipcRenderer.invoke('inventory:add-sale', sale)
  ,updateSale: (sale) => ipcRenderer.invoke('inventory:update-sale', sale)
  ,deleteSale: (id) => ipcRenderer.invoke('inventory:delete-sale', id)

  // Attendance actions
  ,attendanceCheckIn: (payload) => ipcRenderer.invoke('attendance:checkin', payload)
  ,attendanceCheckOut: (payload) => ipcRenderer.invoke('attendance:checkout', payload)

  // Payroll mutations
  ,addPayrollRecord: (payload) => ipcRenderer.invoke('payroll:add-record', payload)
  ,updatePayrollRecord: (payload) => ipcRenderer.invoke('payroll:update-record', payload)
  ,deletePayrollRecord: (id) => ipcRenderer.invoke('payroll:delete-record', id)

  // E-Wallet
  ,getGCashRecords: () => ipcRenderer.invoke('ewallet:gcash:list')
  ,addGCashRecord: (record) => ipcRenderer.invoke('ewallet:gcash:add', record)
  ,updateGCashRecord: (record) => ipcRenderer.invoke('ewallet:gcash:update', record)
  ,deleteGCashRecord: (id) => ipcRenderer.invoke('ewallet:gcash:delete', id)

  ,getPayMayaRecords: () => ipcRenderer.invoke('ewallet:paymaya:list')
  ,addPayMayaRecord: (record) => ipcRenderer.invoke('ewallet:paymaya:add', record)
  ,updatePayMayaRecord: (record) => ipcRenderer.invoke('ewallet:paymaya:update', record)
  ,deletePayMayaRecord: (id) => ipcRenderer.invoke('ewallet:paymaya:delete', id)

  ,getJuanPayRecords: () => ipcRenderer.invoke('ewallet:juanpay:list')
  ,addJuanPayRecord: (record) => ipcRenderer.invoke('ewallet:juanpay:add', record)
  ,updateJuanPayRecord: (record) => ipcRenderer.invoke('ewallet:juanpay:update', record)
  ,deleteJuanPayRecord: (id) => ipcRenderer.invoke('ewallet:juanpay:delete', id)
});
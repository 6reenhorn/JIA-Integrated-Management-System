import React from 'react';
import MainLayoutCard from '../../layout/MainLayoutCard';
import LayoutCard from '../../layout/LayoutCard';
import SalesFilters from './SalesFilters';
import SalesTable from './SalesTable';
import SalesActions from './SalesActions';

// Fixed: 'Paymaya' → 'PayMaya' in the interface
interface SalesStatsProps {
  totalSales: number;
  totalAmount: number;
  averageSale: number;
  totalItemsSold: number;
  sections: Array<{ id: string; label: string; key: string }>;
  activeSection: string;
  onSectionChange: (section: string) => void;
  isAdding?: boolean;
  isDeleting?: boolean;

  // Sales data and handlers
  salesRecords: Array<{
    id: number;
    date: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
    paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay';
  }>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onAddSale: () => void;
  onEditSale: (id: number) => void;
  onDeleteSale: (id: number) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  
  // Refresh functionality
  onRefreshSales: () => void;
  isRefreshingSales: boolean;
}

const SalesStats: React.FC<SalesStatsProps> = ({
  totalSales,
  totalAmount,
  averageSale,
  totalItemsSold,
  sections,
  activeSection,
  onSectionChange,
  salesRecords,
  searchTerm,
  setSearchTerm,
  selectedDate,
  setSelectedDate,
  onAddSale,
  onEditSale,
  onDeleteSale,
  currentPage,
  onPageChange,
  isLoading = false,
  isAdding = false,
  isDeleting = false,
  onRefreshSales,
  isRefreshingSales
}) => {
  const totalPages = Math.ceil(salesRecords.length / 10);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Selected Date Sales */}
        <LayoutCard>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Selected Date Sales</h3>
          <p className="text-3xl font-bold text-gray-900">₱{totalAmount.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">{totalSales} Transactions</p>
        </LayoutCard>

        {/* Selected Date Quantity */}
        <LayoutCard>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Selected Date Quantity</h3>
          <p className="text-3xl font-bold text-gray-900">{totalItemsSold}</p>
          <p className="text-xs text-gray-500 mt-1">Item Sold</p>
        </LayoutCard>

        {/* Total Sales */}
        <LayoutCard>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Sales</h3>
          <p className="text-3xl font-bold text-gray-900">₱{totalAmount.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">All Time</p>
        </LayoutCard>

        {/* Average Sales */}
        <LayoutCard>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Average sales</h3>
          <p className="text-3xl font-bold text-gray-900">₱{averageSale.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Per Transaction</p>
        </LayoutCard>
      </div>

      {/* Sales Section with MainLayoutCard */}
      <MainLayoutCard 
        sections={sections} 
        activeSection={activeSection} 
        onSectionChange={onSectionChange}
      >
        <div className="space-y-6">
          <SalesFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onAddSale={onAddSale}
            salesRecordsCount={salesRecords.length}
            onRefresh={onRefreshSales}
            isRefreshing={isRefreshingSales}
          />
          <SalesTable
            salesRecords={salesRecords}
            onEditSale={onEditSale}
            onDeleteSale={onDeleteSale}
            currentPage={currentPage}
            isLoading={isLoading}
            isAdding={isAdding}
            isDeletingRecord={isDeleting}
          />
          <SalesActions 
            currentPage={currentPage}
            totalPages={totalPages}
            filteredCount={salesRecords.length}
            totalCount={salesRecords.length}
            onPageChange={onPageChange}
          />
        </div>
      </MainLayoutCard>
    </div>
  );
};

export default SalesStats;
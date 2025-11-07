import React, { useState } from 'react';
import LayoutCard from '../../layout/LayoutCard';
import { Search, Plus, X } from 'lucide-react';
import type { GCashRecord } from '../../../types/ewallet_types';
import GCashRecordsTable from './GcashRecords';
import CustomDatePicker from '../../common/CustomDatePicker';

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

interface GCashProps {
  records: GCashRecord[];
  onOpenModal: () => void;
  isLoading: boolean;
  onDelete?: (record: GCashRecord) => void;
  onEdit?: (record: GCashRecord) => void;
}

const GCash: React.FC<GCashProps> = ({ records, onOpenModal, isLoading, onDelete, onEdit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const recordsPerPage = 10;

  // Calculate today's statistics
  const todayStats = React.useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const todayRecords = records.filter(record => record.date === todayStr);
    
    const cashInRecords = todayRecords.filter(r => r.transactionType === 'Cash-In');
    const cashOutRecords = todayRecords.filter(r => r.transactionType === 'Cash-Out');
    
    const totalCashIn = cashInRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalCashInCharges = cashInRecords.reduce((sum, r) => sum + r.serviceCharge, 0);
    const totalCashOut = cashOutRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalCashOutCharges = cashOutRecords.reduce((sum, r) => sum + r.serviceCharge, 0);
    
    return {
      cashIn: totalCashIn,
      cashInCharges: totalCashInCharges,
      cashOut: totalCashOut,
      cashOutCharges: totalCashOutCharges
    };
  }, [records]);

  // Filter records based on search term and date filter
  const filteredRecords = records.filter(record => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || (
      (record.referenceNumber || '')?.toLowerCase().includes(term) ||
      (record.transactionType || '')?.toLowerCase().includes(term) ||
      (record.chargeMOP || '')?.toLowerCase().includes(term)
    );

    const matchesDate = !filterDate || (() => {
      const recordDate = new Date(record.date);
      const filterDateLocal = new Date(filterDate as Date);
      return recordDate.getFullYear() === filterDateLocal.getFullYear() &&
            recordDate.getMonth() === filterDateLocal.getMonth() &&
            recordDate.getDate() === filterDateLocal.getDate();
    })();

    return matchesSearch && matchesDate;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage) || 1;
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to page 1 when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDate]);

  return (
    <div className="space-y-6 mt-5">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LayoutCard className="bg-blue-500 min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Cash-In (Today)</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">₱{formatCurrency(todayStats.cashIn)}</div>
          <div className="text-sm text-gray-500">Total Cash-In Amount</div>
        </LayoutCard>
        <LayoutCard className="bg-blue-500 min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Cash-In Charges</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">₱{formatCurrency(todayStats.cashInCharges)}</div>
          <div className="text-sm text-gray-500">Service Fees (Cash-In)</div>
        </LayoutCard>
        <LayoutCard className="bg-blue-500 min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Cash-Out (Today)</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">₱{formatCurrency(todayStats.cashOut)}</div>
          <div className="text-sm text-gray-500">Total Cash-Out Amount</div>
        </LayoutCard>
        <LayoutCard className="bg-blue-500 min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Cash-Out Charges</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">₱{formatCurrency(todayStats.cashOutCharges)}</div>
          <div className="text-sm text-gray-500">Service Fees (Cash-Out)</div>
        </LayoutCard>
      </div>

      {/* GCash Records Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Left side: Title + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">GCash Records</h3>
              {/* <span className="text-sm text-gray-500">({filteredRecords.length} entries)</span> */}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search Records"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              />
            </div>
          </div>

          {/* Right side: Date Filter + Add Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Filter By Date:
              </label>
              <div className="flex items-center gap-2">
                <div className="w-[140px]">
                  <CustomDatePicker
                    selected={filterDate}
                    onChange={(date: Date | null) => setFilterDate(date)}
                    className="text-sm"
                  />
                </div>
                {filterDate && (
                  <button
                    onClick={() => setFilterDate(null)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    title="Clear date filter"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <button
              onClick={onOpenModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#02367B] text-white rounded-lg hover:bg-[#02367B]/90 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Record
            </button>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <GCashRecordsTable
        records={currentRecords}
        isLoading={isLoading}
        onDelete={onDelete}
        onEdit={onEdit}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <div className="text-sm text-gray-500">
          Page {currentPage} of {totalPages} • Showing {currentRecords.length} of {filteredRecords.length} records
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || filteredRecords.length === 0}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {/* Show page numbers (max 5 pages visible) */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 text-sm rounded ${
                  currentPage === pageNum
                    ? 'bg-[#02367B] text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || filteredRecords.length === 0}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default GCash;

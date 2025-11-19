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
  isAdding?: boolean;
  isDeleting?: boolean;
}

const GCash: React.FC<GCashProps> = ({ records, onOpenModal, isLoading, onDelete, onEdit, isAdding = false, isDeleting = false }) => {
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
          <div className="text-3xl font-bold text-red-500 mb-1">₱{formatCurrency(todayStats.cashInCharges)}</div>
          <div className="text-sm text-gray-500">Service Fees (Cash-In)</div>
        </LayoutCard>
        <LayoutCard className="bg-blue-500 min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Cash-Out (Today)</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">₱{formatCurrency(todayStats.cashOut)}</div>
          <div className="text-sm text-gray-500">Total Cash-Out Amount</div>
        </LayoutCard>
        <LayoutCard className="bg-blue-500 min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Cash-Out Charges</h3>
          <div className="text-3xl font-bold text-red-500 mb-1">₱{formatCurrency(todayStats.cashOutCharges)}</div>
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
                    dateFormat="MM/dd/yyyy"
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
              className="flex items-center gap-2 px-4 py-2 bg-[#02367B] text-white rounded-lg hover:bg-[#1C4A9E] focus:outline-none flex-shrink-0"
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
        isAdding={isAdding}
        isDeleting={isDeleting}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <div className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1 || filteredRecords.length === 0}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20px" height="20px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.85355 3.85355C7.04882 3.65829 7.04882 3.34171 6.85355 3.14645C6.65829 2.95118 6.34171 2.95118 6.14645 3.14645L2.14645 7.14645C1.95118 7.34171 1.95118 7.65829 2.14645 7.85355L6.14645 11.8536C6.34171 12.0488 6.65829 12.0488 6.85355 11.8536C7.04882 11.6583 7.04882 11.3417 6.85355 11.1464L3.20711 7.5L6.85355 3.85355ZM12.8536 3.85355C13.0488 3.65829 13.0488 3.34171 12.8536 3.14645C12.6583 2.95118 12.3417 2.95118 12.1464 3.14645L8.14645 7.14645C7.95118 7.34171 7.95118 7.65829 8.14645 7.85355L12.1464 11.8536C12.3417 12.0488 12.6583 12.0488 12.8536 11.8536C13.0488 11.6583 13.0488 11.3417 12.8536 11.1464L9.20711 7.5L12.8536 3.85355Z"
                fill="#000000"
              />
            </svg>
          </button>
          
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || filteredRecords.length === 0}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20px" height="20px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
                fill="#000000"
              />
            </svg>
          </button>
          
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
            <svg width="20px" height="20px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z"
                fill="#000000"
              />
            </svg>
          </button>
          
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || filteredRecords.length === 0}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20px" height="20px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.14645 11.1464C1.95118 11.3417 1.95118 11.6583 2.14645 11.8536C2.34171 12.0488 2.65829 12.0488 2.85355 11.8536L6.85355 7.85355C7.04882 7.65829 7.04882 7.34171 6.85355 7.14645L2.85355 3.14645C2.65829 2.95118 2.34171 2.95118 2.14645 3.14645C1.95118 3.34171 1.95118 3.65829 2.14645 3.85355L5.79289 7.5L2.14645 11.1464ZM8.14645 11.1464C7.95118 11.3417 7.95118 11.6583 8.14645 11.8536C8.34171 12.0488 8.65829 12.0488 8.85355 11.8536L12.8536 7.85355C13.0488 7.65829 13.0488 7.34171 12.8536 7.14645L8.85355 3.14645C8.65829 2.95118 8.34171 2.95118 8.14645 3.14645C7.95118 3.34171 7.95118 3.65829 8.14645 3.85355L11.7929 7.5L8.14645 11.1464Z"
                fill="#000000"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GCash;

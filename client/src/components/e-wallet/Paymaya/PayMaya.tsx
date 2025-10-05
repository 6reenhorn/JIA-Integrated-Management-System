import React, { useState } from 'react';
import LayoutCard from '../../layout/LayoutCard';
import { Search, Plus, X } from 'lucide-react';
import AddPayMayaRecordModal from '../../../modals/ewallet/PayMayaRecordModal';
import type { PayMayaRecord } from '../../../types/ewallet_types';
import PayMayaRecordsTable from './PayMayaRecords';
import CustomDatePicker from '../../common/CustomDatePicker';

const PayMaya: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymayaRecords, setPaymayaRecords] = useState<PayMayaRecord[]>([]);
  const [filterDate, setFilterDate] = useState<Date | null>(null);

  const recordsPerPage = 10;

  // Handler to add new record
  const handleAddRecord = (newRecord: PayMayaRecord) => {
    setPaymayaRecords(prev => [...prev, newRecord]);
    console.log('New PayMaya record added:', newRecord);
  };

  // Filter records based on search term and date
  const filteredRecords = paymayaRecords.filter(record => {
    const matchesSearch = record.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.transactionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.chargeMOP.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !filterDate || (() => {
      const recordDate = new Date(record.date);
      const filterDateLocal = new Date(filterDate);
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

  // Reset to page 1 when search term or filter date changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDate]);

  return (
    <div className="space-y-6 mt-5">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LayoutCard className="bg-blue-500 border-gray-500 min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">PayMaya Balance</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">₱7,010.00</div>
          <div className="text-sm text-gray-500">Available Funds</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Total Cash-In</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">₱7,500.00</div>
          <div className="text-sm text-gray-500">This Month</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Total Cash-Out</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">₱500.00</div>
          <div className="text-sm text-gray-500">This Month</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Service Charges</h3>
          <div className="text-3xl font-bold text-red-500 mb-1">₱10.00</div>
          <div className="text-sm text-gray-500">Monthly Fee</div>
        </LayoutCard>
      </div>

      {/* PayMaya Records Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Left side: Title + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">PayMaya Records</h3>
              <span className="text-sm text-gray-500">({filteredRecords.length} entries)</span>
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
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#02367B] text-white rounded-lg hover:bg-[#02367B]/90 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Record
            </button>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <PayMayaRecordsTable
        records={currentRecords}
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

      {/* Modal */}
      <AddPayMayaRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddRecord={handleAddRecord}
      />
    </div>
  );
};

export default PayMaya;
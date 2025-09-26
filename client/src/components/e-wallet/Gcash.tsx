import React, { useState } from 'react';
import LayoutCard from '../layout/LayoutCard';
import { Search, Plus } from 'lucide-react';
import AddGCashRecordModal from '../../modals/ewallet/gcashrecordmodal';
import type { GCashRecord } from '../../modals/ewallet/gcashrecordmodal';
import GCashRecordsTable from './GcashRecords';

const GCash: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gcashRecords, setGcashRecords] = useState<GCashRecord[]>([]);

  // Handler to add new record
  const handleAddRecord = (newRecord: GCashRecord) => {
    setGcashRecords(prev => [...prev, newRecord]);
    console.log('New GCash record added:', newRecord);
  };

  // Handler to delete record
  const handleDeleteRecord = (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      setGcashRecords(prev => prev.filter(record => record.id !== id));
    }
  };

  // Handler to edit record (placeholder)
  const handleEditRecord = (record: GCashRecord) => {
    console.log('Edit record:', record);
    // Implement edit functionality here
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(gcashRecords.length / 10) || 1;

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LayoutCard className="bg-blue-500 border-gray-500 min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Total Cash</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">₱7,380.00</div>
          <div className="text-sm text-gray-500 opacity-80">Money In</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Total Charges</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">₱75.00</div>
          <div className="text-sm text-gray-500">Transaction Fees</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Place Holder</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">₱7,380.00</div>
          <div className="text-sm text-gray-500">Total Revenue</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Place Holder</h3>
          <div className="text-3xl font-bold text-red-500 mb-1">0</div>
          <div className="text-sm text-gray-500">Active Today</div>
        </LayoutCard>
      </div>

      {/* GCash Records Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Left side: Title + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">GCash Records</h3>
              <span className="text-sm text-gray-500">({gcashRecords.length} entries)</span>
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

          {/* Right side: Add Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#02367B] text-white rounded-lg hover:bg-[#02367B]/90 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add GCash Record
          </button>
        </div>
      </div>

      {/* Records Table */}
      <GCashRecordsTable
        records={gcashRecords}
        onEditRecord={handleEditRecord}
        onDeleteRecord={handleDeleteRecord}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {[...Array(Math.min(3, totalPages))].map((_, i) => {
            const pageNum = i + 1;
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
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      <AddGCashRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddRecord={handleAddRecord}
      />
    </div>
  );
};

export default GCash;

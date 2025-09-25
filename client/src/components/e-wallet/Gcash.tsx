import React, { useState } from 'react';
import LayoutCard from '../layout/LayoutCard';
import MainLayoutCard from '../layout/MainLayoutCard';
import { Search } from 'lucide-react';

const GCash: React.FC = () => {
  const [activeSection, setActiveSection] = useState('records');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    { label: 'GCash Records', key: 'records' }
  ];

  const mockTransactions = [
    {
      id: 1,
      date: '9/23/2025',
      referenceNumber: '123234134',
      transactionType: 'Cash-In',
      amount: 400.00,
      serviceCharge: 10.00,
      chargeMOP: 'GCash'
    },
    {
      id: 2,
      date: '9/25/2025',
      referenceNumber: '73784034',
      transactionType: 'Cash-Out',
      amount: 500.00,
      serviceCharge: 10.00,
      chargeMOP: 'Cash'
    },
    {
      id: 3,
      date: '9/25/2025',
      referenceNumber: '23456453',
      transactionType: 'Cash-In',
      amount: 600.00,
      serviceCharge: 15.00,
      chargeMOP: 'Cash'
    }
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(mockTransactions.length / 10);

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LayoutCard className="bg-blue-500 border-gray-500 min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Total Cash</h3>
          <div className="text-3xl font-bold text-black mb-1">₱7,380.00</div>
          <div className="text-sm text-gray-500 opacity-80">Money In</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-red-500 font-medium mb-2">Total Charges</h3>
          <div className="text-3xl font-bold text-red-500 mb-1">₱75.00</div>
          <div className="text-sm text-red-500">Transaction Fees</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-green-500 font-medium mb-2">Place Holder</h3>
          <div className="text-3xl font-bold text-green-600 mb-1">₱7,380.00</div>
          <div className="text-sm text-green-500">Total Revenue</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Place Holder</h3>
          <div className="text-3xl font-bold text-red-500 mb-1">0</div>
          <div className="text-sm text-gray-500">Active Today</div>
        </LayoutCard>
      </div>

      {/* Transaction Table Section */}
      <MainLayoutCard sections={sections} activeSection={activeSection} onSectionChange={setActiveSection}>
        {activeSection === 'records' && (
          <div className="space-y-6 mt-5">
            {/* Search and Add Record Button */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search Categories"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-90"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#02367B] text-white rounded-lg hover:bg-[#02367B]/90 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Record
              </button>
            </div>

            {/* Transaction Table */}
            <div className="overflow-x-auto border-2 border-gray-200 rounded-lg">
              <table className="w-full ">
                <thead className="border-b border-gray-200" style={{ backgroundColor: '#EDEDED' }}>
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Reference Number</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Transaction Type</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Amount</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Service Charge</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Charge MOP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {transaction.date}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {transaction.referenceNumber}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {transaction.transactionType}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {transaction.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {transaction.serviceCharge.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {transaction.chargeMOP}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                
                {/* Page Numbers */}
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
          </div>
        )}
      </MainLayoutCard>
    </div>
  );
};

export default GCash;
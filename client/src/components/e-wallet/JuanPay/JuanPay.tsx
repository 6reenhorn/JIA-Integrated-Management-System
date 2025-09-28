import React, { useState } from 'react';
import LayoutCard from '../../layout/LayoutCard';
import { Search } from 'lucide-react';

const JuanPay: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const mockTransactions = [
    {
      id: 1,
      date: '9/24/2025',
      referenceNumber: 'JP123456',
      transactionType: 'Bill Payment',
      amount: 1500.0,
      serviceCharge: 10.0,
      chargeMOP: 'JuanPay'
    },
    {
      id: 2,
      date: '9/23/2025',
      referenceNumber: 'JP234567',
      transactionType: 'Transfer',
      amount: 3200.0,
      serviceCharge: 15.0,
      chargeMOP: 'Cash'
    },
    {
      id: 3,
      date: '9/22/2025',
      referenceNumber: 'JP345678',
      transactionType: 'Remittance',
      amount: 8800.0,
      serviceCharge: 20.0,
      chargeMOP: 'JuanPay'
    }
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(mockTransactions.length / 10);

  return (
    <div className="space-y-6 mt-5">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LayoutCard className="bg-blue-500 border-gray-500 min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">JuanPay Balance</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">₱7,100.00</div>
          <div className="text-sm text-gray-500">Total Sales</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Beginning Balance</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">₱15,500.00</div>
          <div className="text-sm text-gray-500">Start of Month</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Ending Balance</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">₱8,400.00</div>
          <div className="text-sm text-gray-500">Current Month</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Average per Record</h3>
          <div className="text-3xl font-bold text-red-500 mb-1">₱2,366.67</div>
          <div className="text-sm text-gray-500">Per Transaction</div>
        </LayoutCard>
      </div>

      {/* JuanPay Records Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Left side: Title + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">JuanPay Records</h3>
              <span className="text-sm text-gray-500">({mockTransactions.length} entries)</span>
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
          <button className="flex items-center gap-2 px-4 py-2 bg-[#02367B] text-white rounded-lg hover:bg-[#02367B]/90 transition-colors whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Record
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="overflow-x-auto border-2 border-gray-200 rounded-lg">
        <table className="w-full">
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
                <td className="py-4 px-6 text-sm text-gray-900">{transaction.date}</td>
                <td className="py-4 px-6 text-sm text-gray-900">{transaction.referenceNumber}</td>
                <td className="py-4 px-6 text-sm text-gray-900">{transaction.transactionType}</td>
                <td className="py-4 px-6 text-sm text-gray-900">{transaction.amount.toFixed(2)}</td>
                <td className="py-4 px-6 text-sm text-gray-900">{transaction.serviceCharge.toFixed(2)}</td>
                <td className="py-4 px-6 text-sm text-gray-900">{transaction.chargeMOP}</td>
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
  );
};

export default JuanPay;

import React, { useState } from 'react';
import type { JuanPayRecord } from '../../../types/ewallet_types';
import JuanPayStatsCards from './JuanPayStatscards';
import JuanPayFilter from './JuanPayFilters';
import JuanPayTable from './juanPayTables';

interface JuanPayProps {
  records: JuanPayRecord[];
  onOpenModal: () => void;
  isLoading: boolean;
  onRefresh?: () => Promise<void>;
  onDelete?: (record: JuanPayRecord) => void;
  onEdit?: (record: JuanPayRecord) => void;
  isAdding?: boolean;
  isDeleting?: boolean;
}

const JuanPay: React.FC<JuanPayProps> = ({ 
  records, 
  onOpenModal, 
  isLoading, 
  onRefresh,
  onDelete, 
  onEdit,
  isAdding = false, 
  isDeleting = false 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const recordsPerPage = 10;

  const stats = React.useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const targetDateStr = filterDate
      ? `${filterDate.getFullYear()}-${String(filterDate.getMonth() + 1).padStart(2, '0')}-${String(filterDate.getDate()).padStart(2, '0')}`
      : todayStr;

    const todayRecords = records.filter(record => record.date === targetDateStr);

    const totalBeginning = todayRecords.reduce((sum, r) => {
      if (!r.beginnings) return sum;
      if (!Array.isArray(r.beginnings)) return sum;
      const amounts = r.beginnings.map(b => {
        if (typeof b === 'object' && b !== null && 'amount' in b) {
          return typeof b.amount === 'number' ? b.amount : parseFloat(b.amount) || 0;
        }
        return typeof b === 'number' ? b : parseFloat(b) || 0;
      });
      return sum + amounts.reduce((a, b) => a + b, 0);
    }, 0);

    const totalEnding = todayRecords.reduce((sum, r) => sum + r.ending, 0);
    const totalSales = todayRecords.reduce((sum, r) => sum + r.sales, 0);

    const avgSales = todayRecords.length > 0 ? totalSales / todayRecords.length : 0;

    return {
      totalBeginning,
      totalEnding,
      totalSales,
      avgSales
    };
  }, [records, filterDate]);

  const filteredRecords = records.filter(record => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || (
      record.date.toLowerCase().includes(term) ||
      (Array.isArray(record.beginnings) 
        ? record.beginnings.map(b => typeof b === 'object' && b !== null && 'amount' in b ? b.amount.toString() : String(b)).join(' ').toLowerCase().includes(term)
        : String(record.beginnings || '').toLowerCase().includes(term)) ||
      record.ending.toString().includes(term) ||
      record.sales.toString().includes(term)
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

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        await new Promise(resolve => setTimeout(resolve, 500));
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage) || 1;
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDate]);

  return (
    <div className="space-y-6 mt-5">
      <JuanPayStatsCards 
        isLoading={isLoading} 
        stats={stats} 
        filterDate={filterDate} 
      />

      <JuanPayFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        onOpenModal={onOpenModal}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <JuanPayTable
        records={currentRecords}
        isLoading={isLoading}
        onDelete={onDelete}
        onEdit={onEdit}
        isAdding={isAdding}
        isDeleting={isDeleting}
      />

      <div className="flex items-center justify-between pt-1 pb-0">
        <div className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1 || filteredRecords.length === 0}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
                className={`px-3 py-1 text-sm rounded focus:outline-none ${
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
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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

export default JuanPay;
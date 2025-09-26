import React from 'react';

interface SalesActionsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filteredCount: number;
  totalCount: number;
}

const SalesActions: React.FC<SalesActionsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  filteredCount,
  totalCount,
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, currentPage - 1);
      let endPage = Math.min(totalPages, currentPage + 1);
      
      // Adjust if we're at the beginning or end
      if (currentPage <= 2) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - maxVisiblePages + 1;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-between items-center text-sm text-gray-700">
      <p>
        Showing {filteredCount} of {totalCount} sales
      </p>
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm text-gray-600 border border-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded"
        >
          Previous
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1.5 text-sm border rounded ${
              currentPage === page
                ? 'bg-[#02367B] text-white border-[#02367B]'
                : 'text-gray-500 border-gray-300 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1.5 text-sm text-gray-600 border border-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SalesActions;
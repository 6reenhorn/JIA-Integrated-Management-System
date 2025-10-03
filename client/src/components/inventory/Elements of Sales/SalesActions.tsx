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
}) => {
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 10;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 4) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) {
        pages.push('...');
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {visiblePages.map((page, idx) => (
          typeof page === 'number' ? (
            <button
              key={idx}
              className={`px-3 py-1 text-sm rounded ${
                currentPage === page 
                  ? 'bg-[#02367B] text-white' 
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ) : (
            <span key={idx} className="px-2 py-1 text-sm text-gray-500">
              {page}
            </span>
          )
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SalesActions;
import React from 'react';

interface PayrollActionsProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

const PayrollActions: React.FC<PayrollActionsProps> = ({
  currentPage,
  pageCount,
  onPageChange,
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(pageCount - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < pageCount - 1) {
      rangeWithDots.push('...', pageCount);
    } else if (pageCount > 1) {
      rangeWithDots.push(pageCount);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-between pt-1">
      <div className="text-sm text-gray-500">
        Page {currentPage} of {pageCount}
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
              className={`px-3 py-1 text-sm rounded ${currentPage === page ? 'bg-[#02367B] text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
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
          disabled={currentPage === pageCount}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PayrollActions;

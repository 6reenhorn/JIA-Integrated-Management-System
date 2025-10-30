import React from 'react';

interface EmployeeActionsProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

const EmployeeActions: React.FC<EmployeeActionsProps> = ({ currentPage, pageCount, onPageChange }) => {
  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (pageCount <= maxVisible) {
      // Show all pages if total is 5 or less
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i);
      }
    } else {
      // Calculate the start and end of the window
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(pageCount, start + maxVisible - 1);
      
      // Adjust start if we're near the end
      if (end === pageCount) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
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
          onClick={() => onPageChange(1)}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          First
        </button>
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {visiblePages.map((page, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 text-sm rounded ${currentPage === page ? 'bg-[#02367B] text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        <button
          disabled={currentPage === pageCount}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
        <button
          disabled={currentPage === pageCount}
          onClick={() => onPageChange(pageCount)}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Last
        </button>
      </div>
    </div>
  );
};

export default EmployeeActions;
import React from 'react';

interface EmployeeActionsProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

const EmployeeActions: React.FC<EmployeeActionsProps> = ({
  currentPage,
  pageCount,
  onPageChange
}) => {
  return (
    <div className="flex items-center justify-between pt-4">
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
        {[...Array(pageCount)].map((_, idx) => (
          <button
            key={idx + 1}
            className={`px-3 py-1 text-sm rounded ${currentPage === idx + 1 ? 'bg-[#02367B] text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
            onClick={() => onPageChange(idx + 1)}
          >
            {idx + 1}
          </button>
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

export default EmployeeActions;
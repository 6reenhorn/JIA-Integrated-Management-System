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
  return (
    <div className="flex justify-between items-center text-sm text-gray-700">
      <p>
        Showing {filteredCount} of {totalCount} sales
      </p>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-100"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-100"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SalesActions;

import React from 'react';

interface InventoryActionsProps {
  currentPage: number;
  totalPages: number;
  filteredCount: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const InventoryActions: React.FC<InventoryActionsProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-1">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1.5 text-sm text-gray-600 border border-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded"
        >
          Previous
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
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1.5 text-sm border rounded ${
                currentPage === pageNum
                  ? 'bg-[#02367B] text-white border-[#02367B]'
                  : 'text-gray-500 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1.5 text-sm text-gray-600 border border-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default InventoryActions;

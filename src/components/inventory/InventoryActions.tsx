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
  filteredCount,
  totalCount,
  onPageChange
}) => {
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t">
      <div className="text-sm text-gray-500">
        Page {currentPage} of {totalPages} • Showing {filteredCount} of {totalCount} items
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 text-sm border rounded ${
              currentPage === page
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
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

export default InventoryActions;
import React from 'react';

interface CategoryActionsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CategoryActions: React.FC<CategoryActionsProps> = ({
  currentPage,
  totalPages,
  onPageChange
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
  const isPreviousDisabled = currentPage === 1 || totalPages === 0;
  const isNextDisabled = currentPage === totalPages || totalPages === 0;

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Page {currentPage} of {totalPages || 1}
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={isPreviousDisabled}
          onClick={() => !isPreviousDisabled && onPageChange(currentPage - 1)}
          className={`px-3 py-1 text-sm border border-gray-300 rounded transition-colors ${
            isPreviousDisabled
              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
              : 'hover:bg-gray-50 cursor-pointer'
          }`}
        >
          Previous
        </button>
        {visiblePages.map((page, idx) => (
          typeof page === 'number' ? (
            <button
              key={idx}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                currentPage === page 
                  ? 'bg-[#02367B] text-white cursor-default' 
                  : 'border border-gray-300 hover:bg-gray-50 cursor-pointer'
              }`}
              onClick={() => currentPage !== page && onPageChange(page)}
              disabled={currentPage === page}
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
          disabled={isNextDisabled}
          onClick={() => !isNextDisabled && onPageChange(currentPage + 1)}
          className={`px-3 py-1 text-sm border border-gray-300 rounded transition-colors ${
            isNextDisabled
              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
              : 'hover:bg-gray-50 cursor-pointer'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CategoryActions;
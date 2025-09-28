import React from 'react';
import { Search, Plus } from 'lucide-react';

interface SalesFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onAddSale: () => void;
  salesRecordsCount: number;
}

const SalesFilters: React.FC<SalesFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedDate,
  setSelectedDate,
  onAddSale,
}) => {
  return (
    <div className="flex items-center justify-between py-4 w-full">
      {/* Sales Record Count + Search Bar */}
      <div className="flex items-center gap-4">
        {/* Sales Record Count */}
        <div className="text-lg font-semibold text-gray-900">
          Sales Record
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search Sales"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm 
              focus:outline-none focus:ring-2 focus:ring-[#02367B] focus:border-transparent 
              w-64"
          />
        </div>
      </div>

      {/* Date + Add Sale */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter By Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-[#02367B] focus:border-transparent"
          />
        </div>

        <button
          onClick={onAddSale}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#02367B]
            text-white text-sm font-medium rounded-lg hover:bg-[#01295a] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Sale
        </button>
      </div>
    </div>
  );
};

export default SalesFilters;
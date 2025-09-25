import React from 'react';
import { Search, Plus } from 'lucide-react';

interface SalesFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onAddSale: () => void;
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
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search Sales"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-md 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            focus:outline-none w-64 transition-all bg-gray-50"
        />
      </div>

      {/* Date + Add Sale */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter By Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-md 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
              focus:outline-none transition-all bg-white font-medium"
          />
        </div>

        <button
          onClick={onAddSale}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 
            text-white rounded-md hover:bg-blue-700 transition-colors 
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            focus:ring-offset-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Sale
        </button>
      </div>
    </div>
  );
};

export default SalesFilters;

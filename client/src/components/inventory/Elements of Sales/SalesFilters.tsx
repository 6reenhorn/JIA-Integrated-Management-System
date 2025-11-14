import React from 'react';
import { Search, Plus, X } from 'lucide-react';
import CustomDatePicker from '../../../components/common/CustomDatePicker';

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
    <div className="w-full">
      {/* Header Section */}
      <div className="flex items-center justify-between mt-6 w-full">
        {/* Left side: Title and Search */}
        <div className="flex items-center gap-4">
          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
            Sales Record
          </h2>

          {/* Search - Left side */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Sales"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02367B] focus:border-transparent w-64"
            />
          </div>
        </div>

        {/* Right side: Date Filter and Add Button */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter By Date:</span>
            <div className="flex items-center gap-2">
              <div className="w-[140px]">
                <CustomDatePicker
                  selected={selectedDate ? new Date(selectedDate) : null}
                  onChange={(date: Date | null) => setSelectedDate(date ? date.toISOString().split('T')[0] : '')}
                  className="text-sm"
                />
              </div>
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Clear date filter"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={onAddSale}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#02367B] text-white text-sm font-medium rounded-lg hover:bg-[#1C4A9E] focus:outline-none flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesFilters;
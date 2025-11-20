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
  onRefresh: () => void;
  isRefreshing: boolean;
}

// Helper function to format date to MM/dd/yyyy
const formatDateToMMDDYYYY = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

// Helper function to parse MM/dd/yyyy to Date
const parseDateFromMMDDYYYY = (dateString: string): Date | null => {
  if (!dateString) return null;
  const [month, day, year] = dateString.split('/');
  if (!month || !day || !year) return null;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

const RefreshBtn = ({ onClick, isSpinning }: { onClick: () => void; isSpinning: boolean }) => {
  return (
    <button 
      onClick={onClick}
      className="p-[10px] border border-gray-300 hover:bg-gray-200 text-black rounded-md flex items-center justify-center"
      title="Refresh sales data"
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className={`transition-transform duration-500 ${isSpinning ? 'rotate-360' : 'rotate-0'}`}
        style={{ transform: isSpinning ? 'rotate(360deg)' : 'rotate(0deg)' }}
      >
        <rect width="24" height="24" fill="none"/>
        <path d="M21.3687 13.5827C21.4144 13.3104 21.2306 13.0526 20.9583 13.0069C20.686 12.9612 20.4281 13.1449 20.3825 13.4173L21.3687 13.5827ZM12 20.5C7.30558 20.5 3.5 16.6944 3.5 12H2.5C2.5 17.2467 6.75329 21.5 12 21.5V20.5ZM3.5 12C3.5 7.30558 7.30558 3.5 12 3.5V2.5C6.75329 2.5 2.5 6.75329 2.5 12H3.5ZM12 3.5C15.3367 3.5 18.2252 5.4225 19.6167 8.22252L20.5122 7.77748C18.9583 4.65062 15.7308 2.5 12 2.5V3.5ZM20.3825 13.4173C19.7081 17.437 16.2112 20.5 12 20.5V21.5C16.7077 21.5 20.6148 18.0762 21.3687 13.5827L20.3825 13.4173Z" fill="#000000"/>
        <path d="M20.4716 2.42157V8.07843H14.8147" stroke="#000000" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
};

const SalesFilters: React.FC<SalesFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedDate,
  setSelectedDate,
  onAddSale,
  onRefresh,
  isRefreshing,
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

          {/* Search and Refresh - Left side */}
          <div className="flex items-center gap-2">
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
            <RefreshBtn onClick={onRefresh} isSpinning={isRefreshing} />
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
                  selected={selectedDate ? parseDateFromMMDDYYYY(selectedDate) : null}
                  onChange={(date: Date | null) => setSelectedDate(date ? formatDateToMMDDYYYY(date) : '')}
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
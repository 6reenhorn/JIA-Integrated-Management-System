import React from 'react';
import { Search, Plus, X } from 'lucide-react';
import CustomDatePicker from '../../common/CustomDatePicker';
import RefreshBtn from '../../common/RefreshBtn';

interface GCashFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterDate: Date | null;
  setFilterDate: (date: Date | null) => void;
  onOpenModal: () => void;
  onRefresh?: () => Promise<void>;
  isRefreshing: boolean;
}

const GCashFilter: React.FC<GCashFilterProps> = ({
  searchTerm,
  setSearchTerm,
  filterDate,
  setFilterDate,
  onOpenModal,
  onRefresh,
  isRefreshing
}) => {
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search Records"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-[360px]"
              />
            </div>
            <RefreshBtn onClick={handleRefresh} isSpinning={isRefreshing} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Filter By Date:
            </label>
            <div className="flex items-center gap-2">
              <div className="w-[140px]">
                <CustomDatePicker
                  selected={filterDate}
                  onChange={(date: Date | null) => setFilterDate(date)}
                  className="text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  dateFormat="MM/dd/yyyy"
                />
              </div>
              {filterDate && (
                <button
                  onClick={() => setFilterDate(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Clear date filter"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={onOpenModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#02367B] text-white rounded-lg hover:bg-[#1C4A9E] focus:outline-none focus:ring-1 focus:ring-blue-500 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default GCashFilter;
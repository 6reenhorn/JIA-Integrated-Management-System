import React, { useState, useRef, useEffect } from 'react';
import CustomDatePicker from '../../common/CustomDatePicker';
import { Calendar, X } from 'lucide-react';

interface OverviewFiltersProps {
  startDate: Date | null;
  endDate: Date | null;
  selectedDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onSelectedDateChange: (date: Date | null) => void;
  onClearFilter: () => void;
  dateRangeWarning: string;
  onWarningChange: (warning: string) => void;
}

const OverviewFilters: React.FC<OverviewFiltersProps> = ({
  startDate,
  endDate,
  selectedDate,
  onStartDateChange,
  onEndDateChange,
  onSelectedDateChange,
  onClearFilter,
  dateRangeWarning,
  onWarningChange
}) => {
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

  const dateFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
        setShowDateFilter(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApplyFilter = () => {
    if ((tempStartDate && !tempEndDate) || (!tempStartDate && tempEndDate)) {
      onWarningChange('Both start and end dates are required');
      return;
    }

    if (tempStartDate && tempEndDate && tempStartDate > tempEndDate) {
      onWarningChange('Start date must be before end date');
      return;
    }
    
    onWarningChange('');
    onStartDateChange(tempStartDate);
    onEndDateChange(tempEndDate);
    setShowDateFilter(false);
  };

  const handleClearAndClose = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    onClearFilter();
    setShowDateFilter(false);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 relative" ref={dateFilterRef}>
        <button
          onClick={() => setShowDateFilter(!showDateFilter)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">
            {(startDate && endDate) ? (
              `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            ) : (
              'Filter by Date Range'
            )}
          </span>
        </button>

        {(startDate || endDate) && (
          <button
            onClick={handleClearAndClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Clear date range filter"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {showDateFilter && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 min-w-[320px]">
            <div className="space-y-3">
              {dateRangeWarning && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-3">
                  {dateRangeWarning}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                <CustomDatePicker
                  selected={tempStartDate}
                  onChange={(date: Date | null) => {
                    setTempStartDate(date);
                    onWarningChange('');
                  }}
                  className="text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                <CustomDatePicker
                  selected={tempEndDate}
                  onChange={(date: Date | null) => {
                    setTempEndDate(date);
                    onWarningChange('');
                  }}
                  className="text-sm w-full"
                />
              </div>
              <button
                onClick={handleApplyFilter}
                disabled={!tempStartDate}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                Apply Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Date Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Summary cards filter</span>
        <div className="w-[140px]">
          <CustomDatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => onSelectedDateChange(date)}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default OverviewFilters;
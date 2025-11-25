import React, { useState, useRef, useEffect } from 'react';
import CustomDatePicker from '../../common/CustomDatePicker';

interface DateRange {
  start: Date;
  end: Date;
}

interface PayrollFiltersProps {
  filterType: 'preset' | 'custom';
  onFilterTypeChange: (type: 'preset' | 'custom') => void;
  selectedPreset: string;
  onSelectedPresetChange: (preset: string) => void;
  customStart: string;
  onCustomStartChange: (start: string) => void;
  customEnd: string;
  onCustomEndChange: (end: string) => void;
  onApply: (range: DateRange | null) => void;
  onReset: () => void;
}

const PayrollFilters: React.FC<PayrollFiltersProps> = ({
  filterType,
  onFilterTypeChange,
  selectedPreset,
  onSelectedPresetChange,
  customStart,
  onCustomStartChange,
  customEnd,
  onCustomEndChange,
  onApply,
  onReset
}) => {
  const presets = ['All Status', 'Paid', 'Pending', 'Overdue'];

  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const presetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (presetRef.current && !presetRef.current.contains(event.target as Node)) {
        setIsPresetOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterTypeChange = (type: 'preset' | 'custom') => {
    onFilterTypeChange(type);
  };

  const handleApply = () => {
    let range: DateRange | null = null;
    if (filterType === 'preset') {
      // For preset, we don't need a date range, just apply the status filter
      onApply(null);
    } else if (filterType === 'custom') {
      const startDate = customStart ? new Date(customStart) : null;
      const endDate = customEnd ? new Date(customEnd) : null;
      if (startDate && endDate) {
        range = { start: startDate, end: endDate };
      }
      onApply(range);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `.wide-calendar { width: 100% !important; }` }} />
      <div className="flex flex-col gap-4 p-4 bg-white rounded-md shadow-md w-96">
      {/* Filter Type Tabs */}
      <div className="flex border-b-[2px] border-[#E5E7EB]">
        {(['preset', 'custom'] as const).map((type) => (
          <button
            key={type}
            onClick={() => handleFilterTypeChange(type)}
            className={`px-4 py-2 text-sm font-medium ${
              filterType === type
                ? 'filter-type-active text-[#03285F]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Preset Filters */}
      {filterType === 'preset' && (
        <div className="dropdown relative text-[15px]" ref={presetRef}>
          <div
            className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 border-[#E5E7EB] rounded-md px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer w-full h-[36px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsPresetOpen(!isPresetOpen)}
          >
            {selectedPreset}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={`transition-transform ${isPresetOpen ? 'rotate-180' : ''}`}
            >
              <polygon points="4,6 12,6 8,12" fill="currentColor" />
            </svg>
          </div>
          <div
            className="dropdown-options mt-1 rounded-md"
            style={{
              display: isPresetOpen ? 'block' : 'none',
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              zIndex: 10,
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            {presets.map((option) => (
              <div
                key={option}
                className="option px-4 py-2 hover:bg-gray-100 cursor-pointer text-[14px]"
                onClick={() => {
                  onSelectedPresetChange(option);
                  onApply(null); // Apply immediately for preset
                  setIsPresetOpen(false);
                }}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Range */}
      {filterType === 'custom' && (
        <>
          <div className="flex gap-4 text-[13px] relative">
            <div className="relative w-full">
              <CustomDatePicker
                selected={customStart ? new Date(customStart) : null}
                onChange={(date: Date | null) => onCustomStartChange(date ? date.toISOString().split('T')[0] : '')}
                className="w-full px-4 py-[7px] border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative w-full">
              <CustomDatePicker
                selected={customEnd ? new Date(customEnd) : null}
                onChange={(date: Date | null) => onCustomEndChange(date ? date.toISOString().split('T')[0] : '')}
                className="w-full px-4 py-[7px] border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </>
      )}

      <div className='flex gap-2'>
        {/* Apply Button */}
        {filterType === 'custom' && (
          <button
            onClick={handleApply}
            className="flex-1 text-sm px-4 py-2 bg-[#02367B] border-2 border-[#1C4A9E] text-white rounded-sm hover:bg-[#1C4A9E] focus:outline-none flex-shrink-0"
          >
            Apply Filter
          </button>
        )}
        {/* Reset Button */}
        <button
          onClick={onReset}
          className="flex-1 text-sm px-4 py-2 bg-gray-500 border-2 border-gray-600 text-white rounded-sm hover:bg-gray-600 focus:outline-none flex-shrink-0"
        >
          Reset Filters
        </button>
      </div>
    </div>
    </>
  );
};

export default PayrollFilters;

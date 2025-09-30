import React, { useState, useRef, useEffect } from 'react';
import AttendanceSearchBar from "../../components/employees/attendance/AttendanceSearchBar";
import AttendanceFilters from "../../components/employees/attendance/AttendanceFilters";
import MainLayoutCard from '../../components/layout/MainLayoutCard';
import AttendanceTable from '../../components/employees/attendance/AttendanceTable';

interface DateRange {
  start: Date;
  end: Date;
}

const Attendance: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterType, setFilterType] = useState<'preset' | 'custom'>('preset');
  const [selectedPreset, setSelectedPreset] = useState('Today');

  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const filterRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleApply = (range: DateRange | null) => {
    setDateRange(range);
    // Here you can add logic to filter attendance data based on the date range
    console.log('Applied date range:', range);
  };

  const handleReset = () => {
    setFilterType('preset');
    setSelectedPreset('Today');
    setCustomStart('');
    setCustomEnd('');
    setDateRange(null);
  };

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsFiltersOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pt-5 relative">
        <AttendanceSearchBar />
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={toggleFilters}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg viewBox="0 0 1000 1000" data-name="Layer 2" id="Layer_2" xmlns="http://www.w3.org/2000/svg" fill="#000000" className="w-5 h-5">
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                <defs><style>{`.cls-1{fill:none;stroke:#020202;stroke-linecap:round;stroke-miterlimit:10;stroke-width:22px;}`}</style></defs>
                <line className="cls-1" x1="184.63" x2="312.9" y1="292.84" y2="292.84"></line>
                <line className="cls-1" x1="541.67" x2="815.37" y1="292.84" y2="292.84"></line>
                <circle className="cls-1" cx="427.04" cy="292.84" r="70.46"></circle>
                <line className="cls-1" x1="815.37" x2="687.1" y1="499.06" y2="499.06"></line>
                <line className="cls-1" x1="458.33" x2="184.63" y1="499.06" y2="499.06"></line>
                <circle className="cls-1" cx="572.96" cy="499.06" r="70.46"></circle>
                <line className="cls-1" x1="815.37" x2="597.03" y1="707.16" y2="707.16"></line>
                <line className="cls-1" x1="368.26" x2="184.63" y1="707.16" y2="707.16"></line>
                <circle className="cls-1" cx="482.89" cy="707.16" r="70.46"></circle>
              </g>
            </svg>
            Custom Filters
          </button>
          {isFiltersOpen && (
            <div ref={filterRef} className="absolute top-full mt-2 right-0 z-10">
              <AttendanceFilters
                filterType={filterType}
                onFilterTypeChange={setFilterType}
                selectedPreset={selectedPreset}
                onSelectedPresetChange={setSelectedPreset}
                customStart={customStart}
                onCustomStartChange={setCustomStart}
                customEnd={customEnd}
                onCustomEndChange={setCustomEnd}
                onApply={handleApply}
                onReset={handleReset}
              />
            </div>
          )}
        </div>
      </div>
      {dateRange && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800">
            Filtering attendance from {dateRange.start.toLocaleDateString()} to {dateRange.end.toLocaleDateString()}
          </p>
        </div>
      )}
      
      {/* Attendance Table */}
      <AttendanceTable />
    </div>
  );
}

export default Attendance;

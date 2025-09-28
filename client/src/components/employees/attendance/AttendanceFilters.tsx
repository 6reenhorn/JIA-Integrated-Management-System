import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomDateInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <div className="relative">
    <input
      {...props}
      ref={ref}
      placeholder="yyyy-MM-dd"
      className={`${props.className} pr-10`}
    />
    <svg
      fill="#000000"
      height="20px"
      width="20px"
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 490 490"
      stroke="#000000"
      className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <g>
          <g>
            <g>
              <path d="M480,50h-55V10c0-5.523-4.477-10-10-10h-60c-5.523,0-10,4.477-10,10v40h-60V10c0-5.523-4.477-10-10-10h-60 c-5.523,0-10,4.477-10,10v40h-60V10c0-5.523-4.477-10-10-10H75c-5.523,0-10,4.477-10,10v40H10C4.477,50,0,54.477,0,60v95h490V60 C490,54.477,485.523,50,480,50z M125,80H85V20h40V80z M265,80h-40V20h40V80z M405,80h-40V20h40V80z"></path>
              <path d="M0,480c0,5.523,4.477,10,10,10h470c5.523,0,10-4.477,10-10V177H0V480z M362.5,214c0-4.142,3.358-7.5,7.5-7.5h50 c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5h-50c-4.142,0-7.5-3.358-7.5-7.5V214z M362.5,304 c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5h-50c-4.142,0-7.5-3.358-7.5-7.5V304z M362.5,394c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5h-50 c-4.142,0-7.5-3.358-7.5-7.5V394z M262.5,214c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.358,7.5,7.5v50 c0,4.142-3.358,7.5-7.5,7.5h-50c-4.142,0-7.5-3.358-7.5-7.5V214z M262.5,304c0-4.142,3.358-7.5,7.5-7.5h50 c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5h-50c-4.142,0-7.5-3.358-7.5-7.5V304z M262.5,394 c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5h-50c-4.142,0-7.5-3.358-7.5-7.5V394z M162.5,214c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5h-50 c-4.142,0-7.5-3.358-7.5-7.5V214z M162.5,304c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.5,7.5,7.5v50 c0,4.142-3.358,7.5-7.5,7.5h-50c-4.142,0-7.5-3.358-7.5-7.5V304z M162.5,394c0-4.142,3.358-7.5,7.5-7.5h50 c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5h-50c-4.142,0-7.5-3.358-7.5-7.5V394z M62.5,214 c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5H70c-4.142,0-7.5-3.358-7.5-7.5V214z M62.5,304c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5H70c-4.142,0-7.5-3.358-7.5-7.5 V304z M62.5,394c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5H70 c-4.142,0-7.5-3.358-7.5-7.5V394z"></path>
            </g>
          </g>
        </g>
      </g>
    </svg>
  </div>
));

interface DateRange {
  start: Date;
  end: Date;
}

interface AttendanceFiltersProps {
  filterType: 'preset' | 'relative' | 'custom';
  onFilterTypeChange: (type: 'preset' | 'relative' | 'custom') => void;
  selectedPreset: string;
  onSelectedPresetChange: (preset: string) => void;
  selectedRelative: string;
  onSelectedRelativeChange: (relative: string) => void;
  customStart: string;
  onCustomStartChange: (start: string) => void;
  customEnd: string;
  onCustomEndChange: (end: string) => void;
  onApply: (range: DateRange | null) => void;
}

const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
  filterType,
  onFilterTypeChange,
  selectedPreset,
  onSelectedPresetChange,
  selectedRelative,
  onSelectedRelativeChange,
  customStart,
  onCustomStartChange,
  customEnd,
  onCustomEndChange,
  onApply
}) => {

  const presets = ['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'Last Month'];
  const relatives = ['Last 7 days', 'Last 30 days'];

  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [isRelativeOpen, setIsRelativeOpen] = useState(false);
  const presetRef = useRef<HTMLDivElement>(null);
  const relativeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (presetRef.current && !presetRef.current.contains(event.target as Node)) {
        setIsPresetOpen(false);
      }
      if (relativeRef.current && !relativeRef.current.contains(event.target as Node)) {
        setIsRelativeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPresetRange = (preset: string): DateRange | null => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    switch (preset) {
      case 'Today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'Yesterday':
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'This Week':
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - now.getDay() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'Last Week':
        start.setDate(now.getDate() - now.getDay() - 7);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - now.getDay() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'This Month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(now.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'Last Month':
        start.setMonth(now.getMonth() - 1);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(now.getMonth());
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        return null;
    }
    return { start, end };
  };

  const getRelativeRange = (relative: string): DateRange | null => {
    const now = new Date();
    const end = new Date(now);
    const start = new Date(now);
    let days = 0;

    switch (relative) {
      case 'Last 7 days':
        days = 7;
        break;
      case 'Last 30 days':
        days = 30;
        break;
      default:
        return null;
    }

    start.setDate(now.getDate() - days);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  };

  const handleFilterTypeChange = (type: 'preset' | 'relative' | 'custom') => {
    onFilterTypeChange(type);
  };

  const handleApply = () => {
    let range: DateRange | null = null;
    if (filterType === 'preset') {
      range = getPresetRange(selectedPreset);
    } else if (filterType === 'relative') {
      range = getRelativeRange(selectedRelative);
    } else if (filterType === 'custom') {
      const startDate = customStart ? new Date(customStart) : null;
      const endDate = customEnd ? new Date(customEnd) : null;
      if (startDate && endDate) {
        range = { start: startDate, end: endDate };
      }
    }
    onApply(range);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `.wide-calendar { width: 100% !important; }` }} />
      <div className="flex flex-col gap-4 p-4 bg-white rounded-md shadow-md w-96">
      {/* Filter Type Tabs */}
      <div className="flex border-b-[2px] border-[#E5E7EB]">
        {(['preset', 'relative', 'custom'] as const).map((type) => (
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
        <div className="dropdown relative" ref={presetRef}>
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
                className="option px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onSelectedPresetChange(option);
                  setIsPresetOpen(false);
                }}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relative Filters */}
      {filterType === 'relative' && (
        <div className="dropdown relative" ref={relativeRef}>
          <div
            className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 border-[#E5E7EB] rounded-md px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer w-full h-[36px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsRelativeOpen(!isRelativeOpen)}
          >
            {selectedRelative}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={`transition-transform ${isRelativeOpen ? 'rotate-180' : ''}`}
            >
              <polygon points="4,6 12,6 8,12" fill="currentColor" />
            </svg>
          </div>
          <div
            className="dropdown-options mt-1 rounded-md"
            style={{
              display: isRelativeOpen ? 'block' : 'none',
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
            {relatives.map((option) => (
              <div
                key={option}
                className="option px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onSelectedRelativeChange(option);
                  setIsRelativeOpen(false);
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
        <div className="flex gap-4 text-[13px] relative">
          <div className="relative w-full">
            <DatePicker
              selected={customStart ? new Date(customStart) : null}
              onChange={(date: Date | null) => onCustomStartChange(date ? date.toISOString().split('T')[0] : '')}
              customInput={<CustomDateInput />}
              className="w-full px-4 py-[7px] border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dateFormat="yyyy-MM-dd"
              popperClassName="datepicker-below-center"
              popperPlacement="bottom"
            />
          </div>
          <div className="relative w-full">
            <DatePicker
              selected={customEnd ? new Date(customEnd) : null}
              onChange={(date: Date | null) => onCustomEndChange(date ? date.toISOString().split('T')[0] : '')}
              customInput={<CustomDateInput />}
              className="w-full px-4 py-[7px] border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dateFormat="yyyy-MM-dd"
              popperClassName="datepicker-below-center"
              popperPlacement="bottom"
            />
          </div>
        </div>
      )}

      {/* Apply Button */}
      <button
        onClick={handleApply}
        className="w-full text-sm px-4 py-2 bg-[#02367B] border-2 border-[#1C4A9E] text-white rounded-sm hover:bg-[#1C4A9E] focus:outline-none flex-shrink-0"
      >
        Apply Filter
      </button>
    </div>
    </>
  );
};

export default AttendanceFilters;

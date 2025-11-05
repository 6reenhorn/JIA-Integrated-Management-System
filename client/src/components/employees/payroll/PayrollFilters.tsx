import React, { useState, useRef, useEffect } from 'react';
import CustomDatePicker from '../../common/CustomDatePicker';

interface PayrollFiltersProps {
  monthFilter: string;
  yearFilter: string;
  statusFilter: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
  onStatusChange: (status: string) => void;
  onReset: () => void;
}

const PayrollFilters: React.FC<PayrollFiltersProps> = ({
  monthFilter,
  statusFilter,
  onMonthChange,
  onStatusChange,
  onReset,
}) => {
  const statuses = ['All Status', 'Paid', 'Pending', 'Overdue'];

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-md shadow-md w-96">
      <div className='flex gap-4'>
        <div className="flex gap-4 text-[13px] relative">
          <div className="relative w-full">
            <CustomDatePicker
              selected={monthFilter !== 'All Months' ? new Date(`${monthFilter} 1, 2024`) : null}
              onChange={(date: Date | null) => onMonthChange(date ? date.toLocaleString('default', { month: 'long' }) : 'All Months')}
              className="w-full px-4 py-[7px] border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="dropdown relative text-[15px]" ref={statusRef}>
          <div
            className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 border-[#E5E7EB] rounded-md px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer w-full h-[36px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsStatusOpen(!isStatusOpen)}
          >
            {statusFilter}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={`transition-transform ${isStatusOpen ? 'rotate-180' : ''}`}
            >
              <polygon points="4,6 12,6 8,12" fill="currentColor" />
            </svg>
          </div>
          <div
            className="dropdown-options mt-1 rounded-md"
            style={{
              display: isStatusOpen ? 'block' : 'none',
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
            {statuses.map((status) => (
              <div
                key={status}
                className="option px-4 py-2 hover:bg-gray-100 cursor-pointer text-[14px]"
                onClick={() => {
                  onStatusChange(status);
                  setIsStatusOpen(false);
                }}
              >
                {status}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='flex gap-2'>
        <button
          className="flex-1 text-sm px-4 py-2 bg-[#02367B] border-2 border-[#1C4A9E] text-white rounded-sm hover:bg-[#1C4A9E] focus:outline-none flex-shrink-0"
        >
          Apply Filter
        </button>

        <button
          onClick={onReset}
          className="flex-1 text-sm px-4 py-2 bg-gray-500 border-2 border-gray-600 text-white rounded-sm hover:bg-gray-600 focus:outline-none flex-shrink-0"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default PayrollFilters;

import React, { useState, useRef, useEffect } from 'react';
import AttendanceSearchBar from "../../components/employees/attendance/AttendanceSearchBar";
import AttendanceFilters from "../../components/employees/attendance/AttendanceFilters";
import AttendanceTable from '../../components/employees/attendance/AttendanceTable';
import type { AttendanceRecord } from "../../types/employee_types";
import AttendanceActions from '../../components/employees/attendance/AttendanceActions';
import axios from 'axios';
import RefreshBtn from '../../components/common/RefreshBtn';

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

  const [employees, setEmployees] = useState<AttendanceRecord[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isSpinning, setIsSpinning] = useState(false);

  // Fetch attendance records function
  const fetchAttendance = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/attendance');
      const data = Array.isArray(response.data) ? response.data : [];
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (err) {
      console.error('Error fetching attendance records:', err);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch attendance records on mount
  useEffect(() => {
    fetchAttendance();
  }, []);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem('attendanceCurrentPage');
    return saved ? parseInt(saved, 10) : 1;
  });
  const pageSize = 4;
  const pageCount = Math.ceil(filteredEmployees.length / pageSize);
  const handlePageChange = (page: number) => setCurrentPage(page);

  useEffect(() => {
    localStorage.setItem('attendanceCurrentPage', currentPage.toString());
  }, [currentPage]);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleApply = (range: DateRange | null) => {
    setDateRange(range);
    if (range) {
      const filtered = employees.filter(employee => {
        const employeeDate = new Date(employee.date);
        return employeeDate >= range.start && employeeDate <= range.end;
      });
      setFilteredEmployees(filtered);
      setCurrentPage(1); // Reset to first page when filtering
    } else {
      setFilteredEmployees(employees);
    }
  };

  const handleReset = () => {
    setFilterType('preset');
    setSelectedPreset('Today');
    setCustomStart('');
    setCustomEnd('');
    setDateRange(null);
    setFilteredEmployees(employees);
    setCurrentPage(1); // Reset to first page when resetting
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

  const handleRefreshSpinning = async () => {
    setIsSpinning(true);
    setIsLoading(true);
    try {
      await fetchAttendance();
    } catch (err) {
      console.error('Error refreshing attendance records:', err);
    } finally {
      setIsSpinning(false);
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center pt-5 relative">
        <div className='flex items-center gap-4'>
          <AttendanceSearchBar />
          <RefreshBtn onClick={handleRefreshSpinning} isSpinning={isSpinning} />
        </div>
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
            <div ref={filterRef} className="absolute top-full mt-2 right-0 z-50">
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

      
      {/* Attendance Table */}
      <AttendanceTable employees={paginatedEmployees} isLoading={isLoading} />

      <div className='pt-1'>
        {/* Pagination Actions */}
        <AttendanceActions currentPage={currentPage} pageCount={pageCount} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}

export default Attendance;

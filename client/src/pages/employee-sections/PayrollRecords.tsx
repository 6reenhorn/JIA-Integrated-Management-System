import React, { useState, useMemo, useRef, useEffect } from 'react';
import PayrollSearchBar from '../../components/employees/payroll/PayrollSearchBar';
import PayrollFilters from '../../components/employees/payroll/PayrollFilters';
import PayrollTable from '../../components/employees/payroll/PayrollTable';
import PayrollActions from '../../components/employees/payroll/PayrollActions';
import PayrollStats from '../../components/employees/payroll/PayrollStats';
import { Plus } from 'lucide-react';

interface PayrollRecord {
  id: number;
  employeeName: string;
  empId: string;
  role: string;
  month: string;
  year: string;
  basicSalary: number;
  deductions: number;
  netSalary: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  paymentDate?: string;
}

const PayrollRecords: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [monthFilter, setMonthFilter] = useState('All Months');
  const [yearFilter, setYearFilter] = useState('All Years');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Mock payroll data
  const [payrollRecords] = useState<PayrollRecord[]>([
    {
      id: 1,
      employeeName: 'Glenn Mark Anino',
      empId: 'EMP001',
      role: 'Developer',
      month: 'October',
      year: '2024',
      basicSalary: 50000,
      deductions: 2500,
      netSalary: 47500,
      status: 'Paid',
      paymentDate: '2024-10-30',
    },
    {
      id: 2,
      employeeName: 'Den Jester Antonio',
      empId: 'EMP002',
      role: 'Designer',
      month: 'October',
      year: '2024',
      basicSalary: 45000,
      deductions: 2250,
      netSalary: 42750,
      status: 'Paid',
      paymentDate: '2024-10-30',
    },
    {
      id: 3,
      employeeName: 'John Jaybird Casia',
      empId: 'EMP003',
      role: 'Designer',
      month: 'October',
      year: '2024',
      basicSalary: 45000,
      deductions: 2250,
      netSalary: 42750,
      status: 'Pending',
    },
    {
      id: 4,
      employeeName: 'John Cyril Espina',
      empId: 'EMP004',
      role: 'Designer',
      month: 'October',
      year: '2024',
      basicSalary: 45000,
      deductions: 2250,
      netSalary: 42750,
      status: 'Overdue',
    },
    {
      id: 5,
      employeeName: 'Sophia Marie Flores',
      empId: 'EMP005',
      role: 'Designer',
      month: 'October',
      year: '2024',
      basicSalary: 45000,
      deductions: 2250,
      netSalary: 42750,
      status: 'Paid',
      paymentDate: '2024-10-30',
    },
    {
      id: 6,
      employeeName: 'Julien Marabe',
      empId: 'EMP006',
      role: 'Designer',
      month: 'September',
      year: '2024',
      basicSalary: 45000,
      deductions: 2250,
      netSalary: 42750,
      status: 'Paid',
      paymentDate: '2024-09-30',
    },
  ]);

  // Filter payroll records
  const filteredRecords = useMemo(() => {
    return payrollRecords.filter(record => {
      const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.empId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMonth = monthFilter === 'All Months' || record.month === monthFilter;
      const matchesYear = yearFilter === 'All Years' || record.year === yearFilter;
      const matchesStatus = statusFilter === 'All Status' || record.status === statusFilter;

      return matchesSearch && matchesMonth && matchesYear && matchesStatus;
    });
  }, [payrollRecords, searchTerm, monthFilter, yearFilter, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalPayroll = filteredRecords.reduce((sum, record) => sum + record.netSalary, 0);
    const paidPayroll = filteredRecords.filter(r => r.status === 'Paid').reduce((sum, record) => sum + record.netSalary, 0);
    const pendingPayroll = filteredRecords.filter(r => r.status === 'Pending').reduce((sum, record) => sum + record.netSalary, 0);
    const overduePayroll = filteredRecords.filter(r => r.status === 'Overdue').reduce((sum, record) => sum + record.netSalary, 0);

    return { totalPayroll, paidPayroll, pendingPayroll, overduePayroll };
  }, [filteredRecords]);

  // Pagination
  const pageSize = 4;
  const pageCount = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleResetFilters = () => {
    setMonthFilter('All Months');
    setYearFilter('All Years');
    setStatusFilter('All Status');
    setSearchTerm('');
    setCurrentPage(1);
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
      <div className="space-y-5">
        <div className="flex justify-between items-center pt-5 relative">
          <PayrollSearchBar />
          <div className="flex items-center gap-4">
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
                  <PayrollFilters
                    monthFilter={monthFilter}
                    yearFilter={yearFilter}
                    statusFilter={statusFilter}
                    onMonthChange={setMonthFilter}
                    onYearChange={setYearFilter}
                    onStatusChange={setStatusFilter}
                    onReset={handleResetFilters}
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => {}}
              className="flex items-center gap-2 text-[14px] h-[36px] bg-[#02367B] border-2 border-[#1C4A9E] rounded-md px-4 text-white hover:bg-[#1C4A9E] focus:outline-none flex-shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payroll
            </button>
          </div>
        </div>

        <PayrollTable payrollRecords={paginatedRecords} isLoading={false} />

        <PayrollActions
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default PayrollRecords;

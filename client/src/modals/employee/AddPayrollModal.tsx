import { useState, useEffect, useRef } from 'react';
import type { Employee } from '../../types/employee_types';
import CustomDatePicker from '../../components/common/CustomDatePicker';

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

interface AddPayrollModalProps {
  onClose?: () => void;
  onAddPayroll?: (payroll: Omit<PayrollRecord, 'id' | 'netSalary'> & { netSalary: number }) => void;
  employees: Employee[];
}

const AddPayrollModal = ({ onClose, onAddPayroll, employees }: AddPayrollModalProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedEmployeeText, setSelectedEmployeeText] = useState('Select Employee');
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [focusedEmployeeOption, setFocusedEmployeeOption] = useState(0);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedMonthText, setSelectedMonthText] = useState('Select Month');
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [focusedMonthOption, setFocusedMonthOption] = useState(0);

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedYearText, setSelectedYearText] = useState('Select Year');
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [focusedYearOption, setFocusedYearOption] = useState(0);

  const [basicSalary, setBasicSalary] = useState('');
  const [deductions, setDeductions] = useState('');
  const [netSalary, setNetSalary] = useState(0);

  const [selectedStatus, setSelectedStatus] = useState<'Paid' | 'Pending' | 'Overdue'>('Pending');
  const [selectedStatusText, setSelectedStatusText] = useState('Select Status');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [focusedStatusOption, setFocusedStatusOption] = useState(0);

  const [paymentDate, setPaymentDate] = useState('');

  const [isFormValid, setIsFormValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const employeeDropdownRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  const toggleEmployeeDropdown = () => {
    setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen);
    setIsMonthDropdownOpen(false);
    setIsYearDropdownOpen(false);
    setIsStatusDropdownOpen(false);
  };

  const handleEmployeeOptionClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedEmployeeText(`${employee.name} (${employee.empId})`);
    setBasicSalary(employee.salary);
    setIsEmployeeDropdownOpen(false);
  };

  const toggleMonthDropdown = () => {
    setIsMonthDropdownOpen(!isMonthDropdownOpen);
    setIsEmployeeDropdownOpen(false);
    setIsYearDropdownOpen(false);
    setIsStatusDropdownOpen(false);
  };

  const handleMonthOptionClick = (month: string, index: number) => {
    setSelectedMonth((index + 1).toString());
    setSelectedMonthText(month);
    setIsMonthDropdownOpen(false);
  };

  const toggleYearDropdown = () => {
    setIsYearDropdownOpen(!isYearDropdownOpen);
    setIsEmployeeDropdownOpen(false);
    setIsMonthDropdownOpen(false);
    setIsStatusDropdownOpen(false);
  };

  const handleYearOptionClick = (year: string) => {
    setSelectedYear(year);
    setSelectedYearText(year);
    setIsYearDropdownOpen(false);
  };

  const toggleStatusDropdown = () => {
    setIsStatusDropdownOpen(!isStatusDropdownOpen);
    setIsEmployeeDropdownOpen(false);
    setIsMonthDropdownOpen(false);
    setIsYearDropdownOpen(false);
  };

  const handleStatusOptionClick = (status: 'Paid' | 'Pending' | 'Overdue', text: string) => {
    setSelectedStatus(status);
    setSelectedStatusText(text);
    setIsStatusDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target as Node)) {
        setIsEmployeeDropdownOpen(false);
      }
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setIsMonthDropdownOpen(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setIsYearDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-calculate net salary
  useEffect(() => {
    const basic = parseFloat(basicSalary) || 0;
    const ded = parseFloat(deductions) || 0;
    setNetSalary(basic - ded);
  }, [basicSalary, deductions]);

  // Validate form
  useEffect(() => {
    const valid = selectedEmployee !== null && selectedMonth !== '' && selectedYear !== '' && basicSalary.trim() !== '' && selectedStatusText !== 'Select Status';
    setIsFormValid(valid);
  }, [selectedEmployee, selectedMonth, selectedYear, basicSalary, selectedStatusText]);

  return (
    <div className="bg-gray-100 shadow-md rounded-md p-6 w-[460px] max-h-[850px]">
      <div>
        <h3 className="text-[20px] font-bold">Add Payroll Record</h3>
        <p className="text-[12px]">Add a new payroll record for an employee with salary details and payment status.</p>
      </div>
      <div className="overflow-y-auto max-h-[650px] mt-4 text-[12px]">
        <form action="submit" className='flex flex-col gap-3'>
          <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4">
            <h3 className="text-[16px] font-bold">Employee Selection</h3>
            <div className='mt-2'>
              <label htmlFor="employee_select" className="text-[12px] font-bold">Employee</label>
              <div className="dropdown relative" ref={employeeDropdownRef}>
                <div
                  className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-md px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[29px]"
                  onClick={toggleEmployeeDropdown}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleEmployeeDropdown();
                      e.preventDefault();
                    }
                  }}
                  tabIndex={0}
                >
                  {selectedEmployeeText}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`transition-transform ${isEmployeeDropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <polygon points="4,6 12,6 8,12" fill="currentColor" />
                  </svg>
                </div>
                <div
                  className="dropdown-options mt-1 rounded-md"
                  style={{
                    display: isEmployeeDropdownOpen ? 'block' : 'none',
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
                    boxSizing: 'border-box',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setFocusedEmployeeOption((prev) => (prev + 1) % employees.length);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setFocusedEmployeeOption((prev) => (prev - 1 + employees.length) % employees.length);
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      if (employees[focusedEmployeeOption]) {
                        handleEmployeeOptionClick(employees[focusedEmployeeOption]);
                      }
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setIsEmployeeDropdownOpen(false);
                    }
                  }}
                  tabIndex={isEmployeeDropdownOpen ? 0 : -1}
                >
                  {employees.map((employee, index) => (
                    <div
                      key={employee.id}
                      className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedEmployeeOption === index ? 'bg-blue-100' : ''}`}
                      onClick={() => handleEmployeeOptionClick(employee)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEmployeeOptionClick(employee);
                        }
                      }}
                      tabIndex={isEmployeeDropdownOpen ? 0 : -1}
                    >
                      {employee.name} ({employee.empId})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4">
            <h3 className="text-[16px] font-bold">Period</h3>
            <div className='flex gap-4 mt-2'>
              <div className="dropdown relative" ref={monthDropdownRef}>
                <p className="text-[12px] font-bold">Month</p>
                <div
                  className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-md px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[29px]"
                  onClick={toggleMonthDropdown}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleMonthDropdown();
                      e.preventDefault();
                    }
                  }}
                  tabIndex={0}
                >
                  {selectedMonthText}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <polygon points="4,6 12,6 8,12" fill="currentColor" />
                  </svg>
                </div>
                <div
                  className="dropdown-options mt-1 rounded-md"
                  style={{
                    display: isMonthDropdownOpen ? 'block' : 'none',
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
                    boxSizing: 'border-box',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setFocusedMonthOption((prev) => (prev + 1) % months.length);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setFocusedMonthOption((prev) => (prev - 1 + months.length) % months.length);
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      handleMonthOptionClick(months[focusedMonthOption], focusedMonthOption);
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setIsMonthDropdownOpen(false);
                    }
                  }}
                  tabIndex={isMonthDropdownOpen ? 0 : -1}
                >
                  {months.map((month, index) => (
                    <div
                      key={month}
                      className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedMonthOption === index ? 'bg-blue-100' : ''}`}
                      onClick={() => handleMonthOptionClick(month, index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleMonthOptionClick(month, index);
                        }
                      }}
                      tabIndex={isMonthDropdownOpen ? 0 : -1}
                    >
                      {month}
                    </div>
                  ))}
                </div>
              </div>
              <div className="dropdown relative" ref={yearDropdownRef}>
                <p className="text-[12px] font-bold">Year</p>
                <div
                  className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-md px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[29px]"
                  onClick={toggleYearDropdown}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleYearDropdown();
                      e.preventDefault();
                    }
                  }}
                  tabIndex={0}
                >
                  {selectedYearText}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <polygon points="4,6 12,6 8,12" fill="currentColor" />
                  </svg>
                </div>
                <div
                  className="dropdown-options mt-1 rounded-md"
                  style={{
                    display: isYearDropdownOpen ? 'block' : 'none',
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
                    boxSizing: 'border-box',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setFocusedYearOption((prev) => (prev + 1) % years.length);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setFocusedYearOption((prev) => (prev - 1 + years.length) % years.length);
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      handleYearOptionClick(years[focusedYearOption]);
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setIsYearDropdownOpen(false);
                    }
                  }}
                  tabIndex={isYearDropdownOpen ? 0 : -1}
                >
                  {years.map((year, index) => (
                    <div
                      key={year}
                      className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedYearOption === index ? 'bg-blue-100' : ''}`}
                      onClick={() => handleYearOptionClick(year)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleYearOptionClick(year);
                        }
                      }}
                      tabIndex={isYearDropdownOpen ? 0 : -1}
                    >
                      {year}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4">
            <h3 className="text-[16px] font-bold">Salary Details</h3>
            <div className='mt-2'>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col justify-center">
                  <label htmlFor="basic_salary" className="text-[12px] font-bold">Basic Salary</label>
                  <input type="number" id="basic_salary" name="basic_salary" placeholder='Enter basic salary' value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
                </div>
                <div className="flex flex-col justify-center">
                  <label htmlFor="deductions" className="text-[12px] font-bold">Deductions</label>
                  <input type="number" id="deductions" name="deductions" placeholder='Enter deductions' value={deductions} onChange={(e) => setDeductions(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
                </div>
              </div>
              <div className='mt-2'>
                <label htmlFor="net_salary" className="text-[12px] font-bold">Net Salary (Auto-calculated)</label>
                <input type="number" id="net_salary" name="net_salary" placeholder='Net salary' value={netSalary.toFixed(2)} readOnly className="border border-gray-300 rounded-md w-full px-2 py-1 bg-gray-100 focus:outline-none" />
              </div>
            </div>
          </div>
          <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4">
            <h3 className="text-[16px] font-bold">Status & Payment</h3>
            <div className='mt-2'>
              <div className="grid grid-cols-2 gap-4">
                <div className="dropdown relative" ref={statusDropdownRef}>
                  <p className="text-[12px] font-bold">Status</p>
                  <div
                    className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-md px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[29px]"
                    onClick={toggleStatusDropdown}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        toggleStatusDropdown();
                        e.preventDefault();
                      }
                    }}
                    tabIndex={0}
                  >
                    {selectedStatusText}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className={`transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
                    >
                      <polygon points="4,6 12,6 8,12" fill="currentColor" />
                    </svg>
                  </div>
                  <div
                    className="dropdown-options mt-1 rounded-md"
                    style={{
                      display: isStatusDropdownOpen ? 'block' : 'none',
                      position: 'absolute',
                      top: '-225%',
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
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setFocusedStatusOption((prev) => (prev + 1) % 3);
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setFocusedStatusOption((prev) => (prev - 1 + 3) % 3);
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        const statusOptions = [
                          { value: 'Paid', text: 'Paid' },
                          { value: 'Pending', text: 'Pending' },
                          { value: 'Overdue', text: 'Overdue' }
                        ];
                        const selected = statusOptions[focusedStatusOption];
                        handleStatusOptionClick(selected.value as 'Paid' | 'Pending' | 'Overdue', selected.text);
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        setIsStatusDropdownOpen(false);
                      }
                    }}
                    tabIndex={isStatusDropdownOpen ? 0 : -1}
                  >
                    <div
                      className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedStatusOption === 0 ? 'bg-blue-100' : ''}`}
                      onClick={() => handleStatusOptionClick('Paid', 'Paid')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleStatusOptionClick('Paid', 'Paid');
                        }
                      }}
                      tabIndex={isStatusDropdownOpen ? 0 : -1}
                    >
                      Paid
                    </div>
                    <div
                      className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedStatusOption === 1 ? 'bg-blue-100' : ''}`}
                      onClick={() => handleStatusOptionClick('Pending', 'Pending')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleStatusOptionClick('Pending', 'Pending');
                        }
                      }}
                      tabIndex={isStatusDropdownOpen ? 0 : -1}
                    >
                      Pending
                    </div>
                    <div
                      className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedStatusOption === 2 ? 'bg-blue-100' : ''}`}
                      onClick={() => handleStatusOptionClick('Overdue', 'Overdue')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleStatusOptionClick('Overdue', 'Overdue');
                        }
                      }}
                      tabIndex={isStatusDropdownOpen ? 0 : -1}
                    >
                      Overdue
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <label htmlFor="payment_date" className="text-[12px] font-bold">Payment Date (Optional)</label>
                  <div className="relative w-full">
                    <CustomDatePicker
                      selected={paymentDate ? new Date(paymentDate) : null}
                      onChange={(date: Date | null) => setPaymentDate(date ? date.toISOString().split('T')[0] : '')}
                      className="w-full px-4 py-[7px] border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div className="w-full flex justify-end gap-2 mt-4 text-[12px] font-bold">
        <button 
          className="border border-gray-300 hover:bg-gray-200 rounded-md px-3 py-1"
          onClick={onClose}>
          Cancel
        </button>
        <button
          className={`border border-gray-300 rounded-md px-3 py-1 text-white ${isFormValid ? 'bg-[#02367B] hover:bg-[#1C4A9E]' : 'bg-gray-400 cursor-not-allowed'}`}
          onClick={() => {
            if (isFormValid && !isSaving && onAddPayroll && selectedEmployee) {
              setIsSaving(true);
              onAddPayroll({
                employeeName: selectedEmployee.name,
                empId: selectedEmployee.empId,
                role: selectedEmployee.role,
                month: selectedMonthText,
                year: selectedYear,
                basicSalary: parseFloat(basicSalary),
                deductions: parseFloat(deductions),
                status: selectedStatus,
                paymentDate: paymentDate || undefined,
                netSalary: netSalary
              });
            }
          }}
          disabled={!isFormValid || isSaving}
        >
          {isSaving ? 'Adding...' : 'Add Payroll'}
        </button>
      </div>
    </div>
  );
}

export default AddPayrollModal;

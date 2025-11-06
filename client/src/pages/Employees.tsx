import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import Portal from '../components/common/Portal';
import EmployeeStats from '../components/employees/management/EmployeeStats';
import EmployeeFilters from '../components/employees/management/EmployeeFilters';
import EmployeeTable from '../components/employees/management/EmployeeTable';
import EmployeeActions from '../components/employees/management/EmployeeActions';
import type { Employee } from '../types/employee_types';
import { filterEmployees, calculateStats } from '../utils/employee_utils';
import MainLayoutCard from '../components/layout/MainLayoutCard';
import EmployeeSearchBar from '../components/employees/management/EmployeeSearchBar';
import AddStaffModal from '../modals/employee/AddStaffModal';
import EditStaffDetailsModal from '../modals/employee/EditStaffDetailsModal';
import AttendanceStats from '../components/employees/attendance/AttendanceStats';
import Attendance from './employee-sections/Attendance';
import PayrollRecords from './employee-sections/PayrollRecords';
import PayrollStats from '../components/employees/payroll/PayrollStats';
import DeleteEmployeeModal from '../modals/employee/DeleteStaffModal';
import AddPayrollModal from '../modals/employee/AddPayrollModal';

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

const PAGE_SIZE = 4;

interface EmployeesProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const Employees: React.FC<EmployeesProps> = ({ activeSection: propActiveSection, onSectionChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: -0, left: 0 });
  const [isDeleting, setIsDeleting] = useState(false);

  const [internalActiveSection, setInternalActiveSection] = useState('staff');

  const activeSection = propActiveSection ?? internalActiveSection;

  const sections = [
    { label: 'Staff Management', key: 'staff' },
    { label: 'Attendance', key: 'attendance' },
    { label: 'Payroll Records', key: 'payroll' }
  ];

  const handleSectionChange = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    } else {
      setInternalActiveSection(section);
    }
  };

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [payrollLoading, setPayrollLoading] = useState(true);

  // Fetch payroll records function
  const fetchPayrollRecords = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/payroll');
      const data = Array.isArray(response.data) ? response.data : [];
      setPayrollRecords(data);
    } catch (err) {
      console.error('Error fetching payroll records:', err);
      setPayrollRecords([]);
    } finally {
      setPayrollLoading(false);
    }
  };

  // Always fetch payroll records on mount and clear any stale local storage
  useEffect(() => {
    try {
      localStorage.removeItem('payrollRecords');
    } catch (_) {
      // ignore storage errors
    }
    fetchPayrollRecords();
  }, []);

  // Fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/employees');
        const data = Array.isArray(response.data) ? response.data : [];
        setEmployees(data);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Update localStorage when employees change
  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem('employees', JSON.stringify(employees));
    }
  }, [employees]);

  // Ensure payroll shows a loading state when navigating to the Payroll section
  useEffect(() => {
    if (activeSection === 'payroll' && payrollRecords.length === 0) {
      setPayrollLoading(true);
      fetchPayrollRecords();
    }
  }, [activeSection]);

  // Removed localStorage persistence for payroll to avoid stale data

  // Calculate stats
  const stats = useMemo(() => calculateStats(employees), [employees]);

  // Calculate payroll stats (for display above main layout)
  const payrollStats = useMemo(() => {
    const toNumber = (value: unknown) => {
      const n = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(n) ? n : 0;
    };

    const totalPayroll = payrollRecords.reduce((sum, record) => sum + toNumber(record.netSalary), 0);
    const paidPayroll = payrollRecords.filter(r => r.status === 'Paid').reduce((sum, record) => sum + toNumber(record.netSalary), 0);
    const pendingPayroll = payrollRecords.filter(r => r.status === 'Pending').reduce((sum, record) => sum + toNumber(record.netSalary), 0);
    const overduePayroll = payrollRecords.filter(r => r.status === 'Overdue').reduce((sum, record) => sum + toNumber(record.netSalary), 0);

    return { totalPayroll, paidPayroll, pendingPayroll, overduePayroll };
  }, [payrollRecords]);

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() =>
    filterEmployees(employees, searchTerm, roleFilter, statusFilter),
    [employees, searchTerm, roleFilter, statusFilter]
  );

  // Pagination logic
  const pageCount = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));

  // Reset to first page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get paginated employees
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  }

  const handleSaveEmployee = async (updatedEmployee: Employee) => {
    try {
      const response = await axios.put(`http://localhost:3001/api/employees/${updatedEmployee.id}`, updatedEmployee);
      setEmployees(prevEmployees =>
        prevEmployees.map(emp =>
          emp.id === updatedEmployee.id ? response.data : emp
        )
      );
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating employee:', err);
      // Handle error (could show a toast or alert)
    }
  }

  const handleAddEmployee = async (newEmployee: Omit<Employee, 'id' | 'empId' | 'lastLogin'> & { address: string; salary: string; contactName: string; contactNumber: string; relationship: string }) => {
    try {
      const response = await axios.post('http://localhost:3001/api/employees', newEmployee);
      setEmployees(prevEmployees => [...prevEmployees, response.data]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding employee:', err);
      // Handle error (could show a toast or alert)
    }
  }

  const handleRequestDelete = (id: number, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const popoverHeight = 80;
    const popoverWidth = 256;
    let top = rect.top - popoverHeight - 20;
    let left = rect.left + rect.width / 2 - popoverWidth / 2;

    // Clamp to viewport
    top = Math.max(10, Math.min(top, window.innerHeight - popoverHeight - 10));
    left = Math.max(10, Math.min(left, window.innerWidth - popoverWidth - 10));

    console.log('Modal position:', top, left);
    setPopoverPosition({ top, left });
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId !== null) {
      setIsDeleting(true);
      try {
        await axios.delete(`http://localhost:3001/api/employees/${deleteId}`);
        setEmployees(prev => prev.filter(emp => emp.id !== deleteId));
      } catch (err) {
        console.error('Error deleting employee:', err);
        // Handle error (could show a toast or alert)
      } finally {
        setIsDeleting(false);
      }
    }
    setShowConfirm(false);
    setDeleteId(null);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setDeleteId(null);
  };

  const handleResetFilters = () => {
    setRoleFilter('All Roles');
    setStatusFilter('All Status');
  };

  // No scroll lock needed when using a portal-rendered overlay
  useEffect(() => {}, [showConfirm]);

  return (
    <div className="space-y-6">
      {/* Employee Stats Section */}
      {activeSection === 'staff' && (
        <EmployeeStats stats={stats} />
      )}
      {/* Attendance Stats Section */}
      {activeSection === 'attendance' && (
        <AttendanceStats />
      )}
      {/* Payroll Stats Section */}
      {activeSection === 'payroll' && (
        <PayrollStats
          totalPayroll={payrollStats.totalPayroll}
          paidPayroll={payrollStats.paidPayroll}
          pendingPayroll={payrollStats.pendingPayroll}
          overduePayroll={payrollStats.overduePayroll}
        />
      )}

      <MainLayoutCard sections={sections} activeSection={activeSection} onSectionChange={handleSectionChange}>
        {/* Staff Management Section */}
        {activeSection === 'staff' && (
          <div className="space-y-6">
            <div className='flex justify-between items-center mb-0'>
              <EmployeeSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              <EmployeeFilters
                onAddStaff={toggleModal}
                roleFilter={roleFilter}
                statusFilter={statusFilter}
                onRoleChange={setRoleFilter}
                onStatusChange={setStatusFilter}
                onReset={handleResetFilters}
              />
            </div>

            <EmployeeTable
              employees={paginatedEmployees}
              isLoading={isLoading}
              onViewEmployee={() => {}}
              onEditEmployee={(id: number) => {
                const emp = employees.find(e => e.id === id) || null;
                setSelectedEmployee(emp);
                setIsEditModalOpen(true);
              }}
              onRequestDelete={handleRequestDelete}
              startIndex={startIndex}
            />

            <EmployeeActions
              currentPage={currentPage}
              pageCount={pageCount}
              onPageChange={handlePageChange}
            />
          </div>
        )}
        {/* Attendance Management Section */}
        {activeSection === 'attendance' && (
          <Attendance />
        )}
        {/* Payroll Records Section */}
        {activeSection === 'payroll' && (
          <PayrollRecords
            payrollRecords={payrollRecords}
            payrollLoading={payrollLoading}
            onUpdatePayrollRecords={setPayrollRecords}
            onRefetchPayrollRecords={fetchPayrollRecords}
          />
        )}
      </MainLayoutCard>

      {/* Employee Modal */}
      {isModalOpen && (
        <Portal>
          <div className='fixed inset-0 z-[1000] flex items-center justify-center'>
            <div
              className='absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm'
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            </div>
            <div className='relative z-[1010]'>
              <AddStaffModal onClose={toggleModal} onAddEmployee={handleAddEmployee} />
            </div>
          </div>
        </Portal>
      )}
      {isEditModalOpen && selectedEmployee && (
        <Portal>
          <div className='fixed inset-0 z-[1000] flex items-center justify-center'>
            <div
              className='absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm'
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            </div>
            <div className='relative z-[1010]'>
              <EditStaffDetailsModal
                employee={selectedEmployee}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveEmployee}
              />
            </div>
          </div>
        </Portal>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <Portal>
          <div className="fixed inset-0 z-[1000] flex items-center justify-center">
            <DeleteEmployeeModal
              isOpen={showConfirm}
              employeeId={deleteId}
              employeeName={employees.find(emp => emp.id === deleteId)?.name}
              isDeleting={isDeleting}
              onClose={() => {
                if (!isDeleting) {
                  setShowConfirm(false);
                  setDeleteId(null);
                }
              }}
              onConfirmDelete={handleConfirmDelete}
            />
          </div>
        </Portal>
      )}
    </div>
  );
};

export default Employees;
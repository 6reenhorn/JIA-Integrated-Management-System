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
import Attendance from './sections/Attendance';

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

  const [internalActiveSection, setInternalActiveSection] = useState('staff');

  const activeSection = propActiveSection ?? internalActiveSection;

  const sections = [
    { label: 'Staff Management', key: 'staff' },
    { label: 'Attendance', key: 'attendance' }
  ];

  const handleSectionChange = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    } else {
      setInternalActiveSection(section);
    }
  };

  const [employees, setEmployees] = useState<Employee[]>([]);

  // Fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/employees');
        setEmployees(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setEmployees([]);
      }
    };

    fetchEmployees();
  }, []);

  // Calculate stats
  const stats = useMemo(() => calculateStats(employees), [employees]);

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
      try {
        await axios.delete(`http://localhost:3001/api/employees/${deleteId}`);
        setEmployees(prev => prev.filter(emp => emp.id !== deleteId));
      } catch (err) {
        console.error('Error deleting employee:', err);
        // Handle error (could show a toast or alert)
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
              onViewEmployee={() => {}}
              onEditEmployee={(id: number) => {
                const emp = employees.find(e => e.id === id) || null;
                setSelectedEmployee(emp);
                setIsEditModalOpen(true);
              }}
              onRequestDelete={handleRequestDelete}
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
          <div
            className="fixed bg-white border border-gray-300 rounded-md shadow-xl px-4 py-2 z-[1100] w-64"
            style={{ top: popoverPosition.top, left: popoverPosition.left, position: 'fixed' }}
          >
            <h3 className="text-[12px] font-semibold mb-2">Confirm Delete</h3>
            <p className="text-[10px] mb-4">Are you sure you want to delete this employee?</p>
            <div className="flex gap-2 justify-end w-full">
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-1 bg-red-500 text-white text-[10px] rounded hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={handleCancelDelete}
                className="px-5 py-1 bg-gray-500 text-white text-[10px] rounded hover:bg-gray-600"
              >
                No
              </button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default Employees;
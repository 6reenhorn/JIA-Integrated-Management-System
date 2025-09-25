import React, { useState, useMemo, useEffect } from 'react';
import EmployeeStats from '../components/employees/EmployeeStats';
import EmployeeFilters from '../components/employees/EmployeeFilters';
import EmployeeTable from '../components/employees/EmployeeTable';
import EmployeeActions from '../components/employees/EmployeeActions';
import type { Employee } from '../types/employee_types';
import { filterEmployees, calculateStats } from '../utils/employee_utils';
import MainLayoutCard from '../components/layout/MainLayoutCard';
import EmployeeSearchBar from '../components/employees/EmployeeSearchBar';
import AddStaffModal from '../modals/employee/AddStaffModal';

import EditStaffDetailsModal from '../modals/employee/EditStaffDetailsModal';

const PAGE_SIZE = 5;

const Employees: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: 'John Cyril Espina',
      empId: 'EMP001',
      role: 'Manager',
      department: 'Front Desk',
      contact: 'johncyril.espina@gmail.com\n+1 (555) 123-4567\n Lingion, Manolo Fortich, Bukidnon',
      status: 'Active',
      lastLogin: '2024-01-15 09:30',
      address: '123 Main Street, City, State, ZIP',
      salary: '50000',
      contactName: 'Jane Doe',
      contactNumber: '555-123-4567',
      relationship: 'Spouse'
    } as Employee,
    {
      id: 2,
      name: 'Den Jester Antonio',
      empId: 'EMP002',
      role: 'Admin',
      department: 'Administrative',
      contact: 'denjester.antonio@gmail.com\n+1 (555) 234-5678\n Manolo Fortich, Bukidnon',
      status: 'Active',
      lastLogin: '2024-01-15 08:45',
      address: '456 Oak Avenue, City, State, ZIP',
      salary: '55000',
      contactName: 'John Smith',
      contactNumber: '555-234-5678',
      relationship: 'Parent'
    } as Employee,
    {
      id: 3,
      name: 'John Jaybord Casia',
      empId: 'EMP003',
      role: 'Sales Associate',
      department: 'Front Desk',
      contact: 'johnjaybord.casia@gmail.com\n+1 (555) 345-6789\n Tagoloan, Misamis Oriental',
      status: 'Active',
      lastLogin: '2024-01-14 16:20',
      address: '789 Pine Road, City, State, ZIP',
      salary: '45000',
      contactName: 'Mary Johnson',
      contactNumber: '555-345-6789',
      relationship: 'Sibling'
    } as Employee,
    {
      id: 4,
      name: 'Sophia Marie Flores',
      empId: 'EMP004',
      role: 'Cashier',
      department: 'Front Desk',
      contact: 'sophiamarie.flores@gmail.com\n+1 (555) 456-7890\n Patag, Cagayyan de Oro City',
      status: 'Active',
      lastLogin: '2024-01-15 10:15',
      address: '321 Elm Street, City, State, ZIP',
      salary: '40000',
      contactName: 'Robert Brown',
      contactNumber: '555-456-7890',
      relationship: 'Friend'
    } as Employee,
    {
      id: 5,
      name: 'Glenn Mark Anino',
      empId: 'EMP005',
      role: 'Maintenance',
      department: 'Maintenance',
      contact: 'glennmark.anino@gmail.com\n+1 (555) 567-8901\n Camaman-an, Cagayyan de Oro City',
      status: 'Inactive',
      lastLogin: '2024-01-10 14:30',
      address: '654 Maple Lane, City, State, ZIP',
      salary: '35000',
      contactName: 'N/A',
      contactNumber: 'N/A',
      relationship: 'Other'
    } as Employee
  ]);

  // Calculate stats
  const stats = useMemo(() => calculateStats(employees), [employees]);

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => 
    filterEmployees(employees, searchTerm, roleFilter, departmentFilter, statusFilter),
    [employees, searchTerm, roleFilter, departmentFilter, statusFilter]
  );

  // Pagination logic
  const pageCount = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));

  // Reset to first page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, departmentFilter, statusFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  }

  const handleSaveEmployee = (updatedEmployee: Employee) => {
    // The updatedEmployee already has the contact string composed and additional fields
    // Temporarily update the employee in the state (since no backend yet)
    setEmployees(prevEmployees =>
      prevEmployees.map(emp =>
        emp.id === updatedEmployee.id ? {
          ...updatedEmployee,
          address: (updatedEmployee as any).address,
          salary: (updatedEmployee as any).salary,
          contactName: (updatedEmployee as any).contactName,
          contactNumber: (updatedEmployee as any).contactNumber,
          relationship: (updatedEmployee as any).relationship
        } : emp
      )
    );
    console.log('Saving employee:', updatedEmployee);
    setIsEditModalOpen(false);
  }

  const handleAddEmployee = (newEmployee: Omit<Employee, 'id' | 'empId' | 'lastLogin'> & { address: string; salary: string; contactName: string; contactNumber: string; relationship: string }) => {
    // Generate a new ID and empId for the new employee
    const newId = Math.max(...employees.map(emp => emp.id)) + 1;
    const newEmpId = `EMP${String(newId).padStart(3, '0')}`;

    // Create the full employee object
    const employee: Employee = {
      ...newEmployee,
      id: newId,
      empId: newEmpId,
      lastLogin: 'Never' // Default for new employees
    };

    // Add the new employee to the state
    setEmployees(prevEmployees => [...prevEmployees, employee]);

    // Close the modal
    setIsModalOpen(false);

    console.log('Adding new employee:', employee);
  }

  return (
    <div className="space-y-6">
      <EmployeeStats stats={stats} />

      {/* Staff Directory Section */}
      <MainLayoutCard title="Staff Management">
        <div className="space-y-6">
          <div className='flex justify-between items-center mb-0'>
            <EmployeeSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <EmployeeFilters onAddStaff={toggleModal} />
          </div>

          <EmployeeTable
            employees={filteredEmployees}
            onViewEmployee={() => {}}
            onEditEmployee={(id: number) => {
              const emp = employees.find(e => e.id === id) || null;
              setSelectedEmployee(emp);
              setIsEditModalOpen(true);
            }}
            onDeleteEmployee={() => {}}
          />

          <EmployeeActions
            currentPage={currentPage}
            pageCount={pageCount}
            onPageChange={handlePageChange}
          />
        </div>
      </MainLayoutCard>

      {/* Employee Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          {/* Backdrop with blur effect - no click handler */}
          <div
            className='absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm'
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          </div>

          {/* Modal content */}
          <div className='relative z-[60]'>
            <AddStaffModal onClose={toggleModal} onAddEmployee={handleAddEmployee} />
          </div>
        </div>
      )}
      {isEditModalOpen && selectedEmployee && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div
            className='absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm'
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          </div>
          <div className='relative z-[60]'>
            <EditStaffDetailsModal
              employee={selectedEmployee}
              onClose={() => setIsEditModalOpen(false)}
              onSave={handleSaveEmployee}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
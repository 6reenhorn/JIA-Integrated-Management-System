import React, { useState, useMemo, useEffect } from 'react';
import DashboardCard from '../view/DashboardCard';
import EmployeeStats from './EmployeeStats';
import EmployeeFilters from './EmployeeFilters';
import EmployeeTable from './EmployeeTable';
import EmployeeActions from './EmployeeActions';
import type { Employee } from './types';
import { filterEmployees, calculateStats } from './utils';

const PAGE_SIZE = 5;

const Employees: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const [employees] = useState<Employee[]>([
    {
      id: 1,
      name: 'John Cyril Espina',
      empId: 'EMP001',
      role: 'Manager',
      department: 'Front Desk',
      contact: 'johncyril.espina@gmail.com\n+1 (555) 123-4567',
      status: 'Active',
      lastLogin: '2024-01-15 09:30'
    },
    {
      id: 2,
      name: 'Den Jester Antonio',
      empId: 'EMP002',
      role: 'Admin',
      department: 'Administrative',
      contact: 'denjester.antonio@gmail.com\n+1 (555) 234-5678',
      status: 'Active',
      lastLogin: '2024-01-15 08:45'
    },
    {
      id: 3,
      name: 'John Jaybord Casia',
      empId: 'EMP003',
      role: 'Sales Associate',
      department: 'Front Desk',
      contact: 'johnjaybord.casia@gmail.com\n+1 (555) 345-6789',
      status: 'Active',
      lastLogin: '2024-01-14 16:20'
    },
    {
      id: 4,
      name: 'Sophia Marie Flores',
      empId: 'EMP004',
      role: 'Cashier',
      department: 'Front Desk',
      contact: 'sophiamarie.flores@gmail.com\n+1 (555) 456-7890',
      status: 'Active',
      lastLogin: '2024-01-15 10:15'
    },
    {
      id: 5,
      name: 'Glenn Mark Anino',
      empId: 'EMP005',
      role: 'Maintenance',
      department: 'Maintenance',
      contact: 'glennmark.anino@gmail.com\n+1 (555) 567-8901',
      status: 'Inactive',
      lastLogin: '2024-01-10 14:30'
    }
  ]);

  // Calculate stats
  const stats = useMemo(() => calculateStats(employees), [employees]);

  // Get unique roles and departments
  const roles = useMemo(() => 
    [...new Set(employees.map(emp => emp.role))], 
    [employees]
  );

  const departmentOptions = useMemo(() => 
    ['All Departments', ...new Set(employees.map(emp => emp.department))], 
    [employees]
  );

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => 
    filterEmployees(employees, searchTerm, roleFilter, departmentFilter, statusFilter),
    [employees, searchTerm, roleFilter, departmentFilter, statusFilter]
  );

  // Pagination logic
  const pageCount = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));
  const paginatedEmployees = useMemo(() => 
    filteredEmployees.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredEmployees, currentPage]
  );

  // Reset to first page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, departmentFilter, statusFilter]);

  const handleViewEmployee = (id: number) => {
    console.log('View employee:', id);
  };

  const handleEditEmployee = (id: number) => {
    console.log('Edit employee:', id);
  };

  const handleDeleteEmployee = (id: number) => {
    console.log('Delete employee:', id);
  };

  const handleAddEmployee = () => {
    console.log('Add new employee');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <DashboardCard title="Employee Management">
        <p className="text-gray-600">
          View and manage employee information, roles, and permissions.
        </p>
        <div className="mt-4 space-y-2">
          <div className="text-sm text-gray-500">Management Features:</div>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Employee profiles</li>
            <li>Role assignments</li>
            <li>Permission management</li>
            <li>Performance tracking</li>
          </ul>
        </div>
      </DashboardCard>
      
      <EmployeeStats stats={stats} />

      {/* Staff Directory Section */}
      <DashboardCard title="Staff Directory">
        <div className="space-y-6">
          <EmployeeFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            roles={roles}
            departmentOptions={departmentOptions}
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            onAddEmployee={handleAddEmployee}
          />

          <EmployeeTable
            employees={paginatedEmployees}
            onViewEmployee={handleViewEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />

          <EmployeeActions
            currentPage={currentPage}
            pageCount={pageCount}
            onPageChange={handlePageChange}
          />
        </div>
      </DashboardCard>
    </div>
  );
};

export default Employees;
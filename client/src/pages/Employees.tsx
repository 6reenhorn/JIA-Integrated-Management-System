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
      contact: 'johncyril.espina@gmail.com\n+1 (555) 123-4567\n Lingion, Manolo Fortich, Bukidnon',
      status: 'Active',
      lastLogin: '2024-01-15 09:30'
    },
    {
      id: 2,
      name: 'Den Jester Antonio',
      empId: 'EMP002',
      role: 'Admin',
      department: 'Administrative',
      contact: 'denjester.antonio@gmail.com\n+1 (555) 234-5678\n Manolo Fortich, Bukidnon',
      status: 'Active',
      lastLogin: '2024-01-15 08:45'
    },
    {
      id: 3,
      name: 'John Jaybord Casia',
      empId: 'EMP003',
      role: 'Sales Associate',
      department: 'Front Desk',
      contact: 'johnjaybord.casia@gmail.com\n+1 (555) 345-6789\n Tagoloan, Misamis Oriental',
      status: 'Active',
      lastLogin: '2024-01-14 16:20'
    },
    {
      id: 4,
      name: 'Sophia Marie Flores',
      empId: 'EMP004',
      role: 'Cashier',
      department: 'Front Desk',
      contact: 'sophiamarie.flores@gmail.com\n+1 (555) 456-7890\n Patag, Cagayyan de Oro City',
      status: 'Active',
      lastLogin: '2024-01-15 10:15'
    },
    {
      id: 5,
      name: 'Glenn Mark Anino',
      empId: 'EMP005',
      role: 'Maintenance',
      department: 'Maintenance',
      contact: 'glennmark.anino@gmail.com\n+1 (555) 567-8901\n Camaman-an, Cagayyan de Oro City',
      status: 'Inactive',
      lastLogin: '2024-01-10 14:30'
    }
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

  return (
    <div className="space-y-6">
      <EmployeeStats stats={stats} />

      <div className='absolute top-20 left-96 z-10'>
        <AddStaffModal />
      </div>
      {/* Staff Directory Section */}
      <MainLayoutCard title="Staff Management">
        <div className="space-y-6">
          <div className='flex justify-between items-center mb-0'>
            <EmployeeSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <EmployeeFilters />
          </div>

          <EmployeeTable
            employees={filteredEmployees}
            onViewEmployee={() => {}}
            onEditEmployee={() => {}}
            onDeleteEmployee={() => {}}
          />

          <EmployeeActions
            currentPage={currentPage}
            pageCount={pageCount}
            onPageChange={handlePageChange}
          />
        </div>
      </MainLayoutCard>
    </div>
  );
};

export default Employees;
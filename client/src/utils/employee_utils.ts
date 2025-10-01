import type { Employee } from '../types/employee_types';

export const EMPLOYEE_STATUSES = ['Active', 'Inactive'] as const;

export type EmployeeStatus = typeof EMPLOYEE_STATUSES[number];

export const getStatusColor = (status: Employee['status']): string => {
  return status === 'Active'
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800';
};

export const getRoleColor = (role: string): string => {
  const colors: { [key: string]: string } = {
    'Manager': 'bg-blue-100 text-blue-800',
    'Admin': 'bg-purple-100 text-purple-800',
    'Sales Associate': 'bg-orange-100 text-orange-800',
    'Cashier': 'bg-pink-100 text-pink-800',
    'Maintenance': 'bg-gray-100 text-gray-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

export const filterEmployees = (
  employees: Employee[],
  searchTerm: string,
  roleFilter: string,
  departmentFilter: string,
  statusFilter: string
): Employee[] => {
  return employees.filter(employee => {
    const matchesSearch = !searchTerm || 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.contact.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'All Roles' || employee.role === roleFilter;
    const matchesDepartment = departmentFilter === 'All Departments' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'All Status' || employee.status === statusFilter;

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });
};

export const calculateStats = (employees: Employee[]): {
  totalEmployees: number;
  activeEmployees: number;
  departments: number;
  newHires: number;
} => {
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
  const departments = [...new Set(employees.map(emp => emp.department))].length;
  
  const newHires = employees.filter(emp => {
    const loginDate = new Date(emp.lastLogin);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return loginDate > weekAgo;
  }).length;

  return {
    totalEmployees,
    activeEmployees,
    departments,
    newHires
  };
};
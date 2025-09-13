import React, { useState } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, User } from 'lucide-react';
import DashboardCard from '../view/DashboardCard';

interface Employee {
  id: number;
  name: string;
  empId: string;
  role: string;
  department: string;
  contact: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  avatar?: string;
}

const PAGE_SIZE = 5;

const Employees: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const [employees] = useState<Employee[]>([
    // ...existing employee data...
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

  // Calculate summary stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
  const departments = [...new Set(employees.map(emp => emp.department))].length;
  const roles = [...new Set(employees.map(emp => emp.role))];
  const departmentOptions = ['All Departments', ...new Set(employees.map(emp => emp.department))];
  const newHires = employees.filter(emp => {
    const loginDate = new Date(emp.lastLogin);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return loginDate > weekAgo;
  }).length;

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchTerm || 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.contact.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'All Roles' || employee.role === roleFilter;
    const matchesDepartment = departmentFilter === 'All Departments' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'All Status' || employee.status === statusFilter;

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  // Pagination logic
  const pageCount = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset to first page when filters/search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, departmentFilter, statusFilter]);

  const getStatusColor = (status: Employee['status']): string => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getRoleColor = (role: string): string => {
    const colors: { [key: string]: string } = {
      'Manager': 'bg-blue-100 text-blue-800',
      'Admin': 'bg-purple-100 text-purple-800',
      'Sales Associate': 'bg-orange-100 text-orange-800',
      'Cashier': 'bg-pink-100 text-pink-800',
      'Maintenance': 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Total Employees">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
              <p className="text-sm text-gray-600">{activeEmployees} active employees</p>
            </div>
            <User className="w-8 h-8 text-blue-500" />
          </div>
        </DashboardCard>
        <DashboardCard title="Departments">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{departments}</p>
              <p className="text-sm text-gray-600">Active departments</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold">{departments}</span>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard title="New Hires">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{newHires}</p>
              <p className="text-sm text-gray-600">This week</p>
            </div>
            <Plus className="w-8 h-8 text-purple-500" />
          </div>
        </DashboardCard>
      </div>

      {/* Staff Directory Section */}
      <DashboardCard title="Staff Directory">
        <div className="space-y-6">
          {/* Toggle Filters Button */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors mb-4"
          >
            <Filter className="w-4 h-4" />
            {filterOpen ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Header with Search and Filters */}
          {filterOpen && (
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option>All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                {departmentOptions.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              
              <button 
                onClick={handleAddEmployee}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Staff
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Staff Member</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Role</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Department</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Contact</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Last Login</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.empId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(employee.role)}`}>
                        {employee.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {employee.department}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900 whitespace-pre-line">
                        {employee.contact}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {employee.lastLogin}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewEmployee(employee.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors" 
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => handleEditEmployee(employee.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors" 
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {pageCount}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(pageCount)].map((_, idx) => (
                <button
                  key={idx + 1}
                  className={`px-3 py-1 text-sm rounded ${currentPage === idx + 1 ? 'bg-gray-900 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                disabled={currentPage === pageCount}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default Employees;
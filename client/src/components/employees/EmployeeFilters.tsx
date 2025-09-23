import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';

interface EmployeeFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (department: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  roles: string[];
  departmentOptions: string[];
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  onAddEmployee: () => void;
}

const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  departmentFilter,
  setDepartmentFilter,
  statusFilter,
  setStatusFilter,
  roles,
  departmentOptions,
  filterOpen,
  setFilterOpen,
  onAddEmployee
}) => {
  return (
    <div className="space-y-4">
      {/* Toggle Filters Button */}
      {/* <button
        onClick={() => setFilterOpen(!filterOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        <Filter className="w-4 h-4" />
        {filterOpen ? 'Hide Filters' : 'Show Filters'}
      </button> */}

      {/* Header with Search and Filters */}
      {filterOpen && (
        <div className="flex flex-col sm:flex-row gap-3">
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
            onClick={onAddEmployee}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeFilters;
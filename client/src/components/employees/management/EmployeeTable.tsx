import React from 'react';
import { Eye, Edit, Trash2, User } from 'lucide-react';
import type { Employee } from '../../../types/employee_types';
import { getStatusColor, getRoleColor } from '../../../utils/employee_utils';

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  onViewEmployee: (id: number) => void;
  onEditEmployee: (id: number) => void;
  onRequestDelete: (id: number, event: React.MouseEvent<HTMLButtonElement>) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  isLoading,
  onViewEmployee,
  onEditEmployee,
  onRequestDelete
}) => {
  if (isLoading) {
    return (
      <div className="border-2 border-[#E5E7EB] rounded-md min-h-[429px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-500">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="overflow-x-auto border-2 border-[#E5E7EB] rounded-md min-h-[429px]">
        <table className="table-fixed w-full">
          <thead className="border-[#E5E7EB] border-b sticky top-0 bg-[#EDEDED] z-10">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[220px]">
                Staff Member
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">
                Role
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[180px]">
                Contact
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">
                Status
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[150px]">
                Last Login
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="text-center py-4 h-[350px] align-middle">
                <p className="text-gray-500">
                  No Employee records found. Add your first record to get started.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="border-2 border-[#E5E7EB] rounded-md min-h-[429px] max-h-[429px] overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <table className="table-fixed w-full">
        <thead className="border-[#E5E7EB] border-b sticky top-0 bg-[#EDEDED] z-10">
          <tr>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[220px]">
              Staff Member
            </th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">
              Role
            </th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[180px]">
              Contact
            </th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">
              Status
            </th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[150px]">
              Last Login
            </th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px] pl-8">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50">
              <td className="py-4 px-6 w-[220px]">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    <div className="text-sm text-gray-500">{employee.empId}</div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6 w-[100px]">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${getRoleColor(employee.role)}`}>
                  {employee.role}
                </span>
              </td>
              <td className="py-4 px-6 w-[180px]">
                <div className="text-sm text-gray-900 whitespace-pre-line">
                  {employee.contact}
                </div>
              </td>
              <td className="py-4 px-6 w-[100px]">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${getStatusColor(employee.status)}`}>
                  {employee.status}
                </span>
              </td>
              <td className="py-4 px-6 w-[150px] text-sm text-gray-600">
                {employee.lastLogin}
              </td>
              <td className="py-4 px-6 w-[120px]">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onViewEmployee(employee.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => onEditEmployee(employee.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => onRequestDelete(employee.id, e)}
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
  );
};

export default EmployeeTable;

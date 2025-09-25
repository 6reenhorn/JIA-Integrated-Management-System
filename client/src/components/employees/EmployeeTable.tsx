import React from 'react';
import { Eye, Edit, Trash2, User } from 'lucide-react';
import type { Employee } from '../../types/employee_types';
import { getStatusColor, getRoleColor } from '../../utils/employee_utils';

interface EmployeeTableProps {
  employees: Employee[];
  onViewEmployee: (id: number) => void;
  onEditEmployee: (id: number) => void;
  onDeleteEmployee: (id: number) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee
}) => {
  return (
    <div className="overflow-x-auto border-2 border-[#E5E7EB] rounded-lg">
      <table className="table-fixed w-full">
        <thead className="border-[#E5E7EB] border-b">
          <tr>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[200px]">Staff Member</th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">Role</th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[200px]">Contact</th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">Status</th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[150px]">Last Login</th>
            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">Actions</th>
          </tr>
        </thead>
      </table>
      <div className="max-h-[370px] overflow-y-auto min-h-[370px]">
        <table className="table-fixed w-full">
          <tbody className="divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="py-4 px-6 w-[200px]">
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
                <td className="py-4 px-6 w-[100px]">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(employee.role)}`}>
                    {employee.role}
                  </span>
                </td>
                <td className="py-4 px-6 w-[200px]">
                  <div className="text-sm text-gray-900 whitespace-pre-line">
                    {employee.contact}
                  </div>
                </td>
                <td className="py-4 px-6 w-[100px]">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                    {employee.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600 w-[150px]">
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
                      onClick={() => onDeleteEmployee(employee.id)}
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
    </div>
  );
};

export default EmployeeTable;

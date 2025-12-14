import React from "react";
import { User } from "lucide-react";
import type { AttendanceRecord } from "../../../types/employee_types";
import { getAttendanceStatusColor } from "../../../utils/attendance_utils";
import { useDateFormat } from '../../../context/DateFormatContext';

interface AttendanceTableProps {
    employees: AttendanceRecord[];
    isLoading?: boolean;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ employees, isLoading = false }) => {
    const { formatDate } = useDateFormat();

    if (isLoading) {
        return (
            <div className="border-2 border-[#E5E7EB] rounded-md min-h-[429px] max-h-[429px] overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <table className="table-fixed w-full">
                    <thead className="border-[#E5E7EB] border-b sticky top-0 bg-[#EDEDED] z-10">
                        <tr>
                            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[165px] min-w-[165px]">Employee Name</th>
                            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[150px] min-w-[150px]">Date</th>
                            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px] min-w-[120px]">Time In</th>
                            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px] min-w-[120px]">Time Out</th>
                            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[100px] min-w-[100px]">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="py-[26px] px-6 w-[165px] min-w-[165px]">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse mr-3 flex-shrink-0"></div>
                                        <div className="min-w-0">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                                            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm w-[150px] min-w-[150px]">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                </td>
                                <td className="py-4 px-6 text-sm w-[120px] min-w-[120px]">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                </td>
                                <td className="py-4 px-6 text-sm w-[120px] min-w-[120px]">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                </td>
                                <td className="py-4 px-6 w-[100px] min-w-[100px]">
                                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                                </td>
                            </tr>
                        ))}
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
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[165px] min-w-[165px]">Employee Name</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[150px] min-w-[150px]">Date</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px] min-w-[120px]">Time In</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px] min-w-[120px]">Time Out</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[100px] min-w-[100px]">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {employees.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-500 h-[350px] align-middle">
                No attendance records found.
              </td>
            </tr>
          ) : (
            employees.map((employee) => (
              <tr key={employee.attendanceId} className="hover:bg-gray-50">
                <td className="py-[26px] px-6 w-[165px] min-w-[165px]">
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
                <td className="py-4 px-6 text-sm w-[150px] min-w-[150px] text-gray-600">
                  <div>
                    {employee.date ? (() => {
                      try {
                        const date = new Date(employee.date);
                        if (isNaN(date.getTime())) return employee.date;
                        return formatDate(date);
                      } catch {
                        return employee.date;
                      }
                    })() : '-'}
                  </div>
                </td>
                <td className="py-4 px-6 text-sm w-[120px] min-w-[120px]">
                  <div className="pf-5">
                    {employee.timeIn ? (() => {
                      try {
                        const date = new Date(employee.timeIn);
                        if (!isNaN(date.getTime())) {
                          return date.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          });
                        }
                      } catch {
                        // Ignore date parsing errors
                      }
                      return employee.timeIn;
                    })() : '-'}
                  </div>
                </td>
                <td className="py-4 px-6 text-sm w-[120px] min-w-[120px]">
                  <div>
                    {employee.timeOut ? (() => {
                      try {
                        const date = new Date(employee.timeOut);
                        if (!isNaN(date.getTime())) {
                          return date.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          });
                        }
                      } catch {
                        // Ignore date parsing errors
                      }
                      return employee.timeOut;
                    })() : '-'}
                  </div>
                </td>
                <td className="py-4 px-6 w-[100px] min-w-[100px]">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md ${getAttendanceStatusColor(employee.status)}`}>
                    {employee.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    );
}

export default AttendanceTable;

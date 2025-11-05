import React from 'react';
import { User } from "lucide-react";

interface PayrollRecord {
  id: number;
  employeeName: string;
  empId: string;
  role: string;
  month: string;
  year: string;
  basicSalary: number;
  deductions: number;
  netSalary: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  paymentDate?: string;
}

interface PayrollTableProps {
  payrollRecords: PayrollRecord[];
  isLoading: boolean;
}

const PayrollTable: React.FC<PayrollTableProps> = ({ payrollRecords, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-[#E5E7EB] rounded-md min-h-[429px] max-h-[429px]">
      <table className="table-fixed w-full">
        <thead className="border-[#E5E7EB] border-b sticky top-0 bg-[#EDEDED] z-10">
          <tr>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[165px] min-w-[165px]">Employee Name</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[150px] min-w-[150px]">Period</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px] min-w-[120px]">Basic Salary</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px] min-w-[120px]">Deductions</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[100px] min-w-[100px]">Net Salary</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[100px] min-w-[100px]">Status</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px] min-w-[120px]">Payment Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {payrollRecords.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="py-[26px] px-6 w-[165px] min-w-[165px]">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                    <div className="text-sm text-gray-500">{record.empId}</div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6 text-sm w-[150px] min-w-[150px] text-gray-600">
                <div>
                  {record.month} {record.year}
                </div>
              </td>
              <td className="py-4 px-6 text-sm w-[120px] min-w-[120px]">
                <div className="pf-5">
                  ₱{record.basicSalary.toLocaleString()}
                </div>
              </td>
              <td className="py-4 px-6 text-sm w-[120px] min-w-[120px]">
                <div>
                  ₱{record.deductions.toLocaleString()}
                </div>
              </td>
              <td className="py-4 px-6 text-sm w-[100px] min-w-[100px]">
                <div>
                  ₱{record.netSalary.toLocaleString()}
                </div>
              </td>
              <td className="py-4 px-6 w-[100px] min-w-[100px]">
                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${record.status === 'Paid' ? 'bg-green-100 text-green-800' : record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {record.status}
                </span>
              </td>
              <td className="py-4 px-6 text-sm w-[120px] min-w-[120px]">
                <div>
                  {record.paymentDate || '-'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PayrollTable;

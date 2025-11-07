import React, { useMemo, useState } from 'react';
import { User, Trash2 } from "lucide-react";
import DeletePayrollRecordModal from '../../../modals/employee/DeletePayrollRecordModal';

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
  onDelete: (id: number) => void;
  headColor?: 'normal' | 'green' | 'red';
}

const PayrollTable: React.FC<PayrollTableProps> = ({ payrollRecords, isLoading, onDelete, headColor = 'normal' }) => {
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const targetRecord = useMemo(() => {
    return payrollRecords.find(r => r.id === deleteTargetId) || null;
  }, [deleteTargetId, payrollRecords]);

  const periodLabel = useMemo(() => {
    if (!targetRecord) return undefined;
    return `${targetRecord.month} ${targetRecord.year}`;
  }, [targetRecord]);
  if (isLoading) {
    return (
      <div className="border-2 border-[#E5E7EB] rounded-md min-h-[429px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-500">Loading payroll records...</p>
        </div>
      </div>
    );
  }

  if (payrollRecords.length === 0) {
    return (
      <div className="overflow-x-auto border-2 border-[#E5E7EB] rounded-md min-h-[429px]">
        <table className="table-auto w-full">
          <thead className={`border-[#E5E7EB] border-b sticky top-0 z-10 ${headColor === 'green' ? 'bg-green-200' : headColor === 'red' ? 'bg-red-200' : 'bg-[#EDEDED]'}`}>
            <tr>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm min-w-[165px]">Employee Name</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm min-w-[150px]">Period</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm min-w-[120px]">Basic Salary</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm min-w-[120px]">Deductions</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm min-w-[100px]">Net Salary</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm min-w-[100px]">Status</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm min-w-[120px]">Payment Date</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm min-w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} className="text-center py-4 h-[350px] align-middle">
                <p className="text-gray-500">
                  No Payroll records found. Add your first record to get started.
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
      <table className="table-auto w-full">
        <thead className={`border-[#E5E7EB] border-b sticky top-0 z-10 ${headColor === 'green' ? 'bg-gradient-to-r from-green-100 via-green-400 to-green-100 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]' : headColor === 'red' ? 'bg-gradient-to-r from-red-100 via-red-400 to-red-100 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]' : 'bg-[#EDEDED]'}`}>
          <tr>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm min-w-[165px]">Employee Name</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm min-w-[150px]">Period</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm min-w-[120px]">Basic Salary</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm min-w-[120px]">Deductions</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm min-w-[100px]">Net Salary</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm min-w-[100px]">Status</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm min-w-[120px]">Payment Date</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm min-w-[80px]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {payrollRecords.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="py-[26px] px-6 min-w-[165px]">
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
              <td className="py-4 px-6 text-sm min-w-[150px] text-gray-600">
                <div>
                  {record.month} {record.year}
                </div>
              </td>
              <td className="py-4 px-6 text-sm min-w-[120px]">
                <div className="pf-5">
                  ₱{record.basicSalary.toLocaleString()}
                </div>
              </td>
              <td className="py-4 px-6 text-sm min-w-[120px]">
                <div>
                  ₱{record.deductions.toLocaleString()}
                </div>
              </td>
              <td className="py-4 px-6 text-sm min-w-[100px]">
                <div>
                  ₱{record.netSalary.toLocaleString()}
                </div>
              </td>
              <td className="py-4 px-6 min-w-[100px]">
                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${record.status === 'Paid' ? 'bg-green-100 text-green-800' : record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {record.status}
                </span>
              </td>
              <td className="py-4 px-6 text-sm min-w-[120px]">
                <div>
                  {record.paymentDate || '-'}
                </div>
              </td>
              <td className="py-4 px-6 min-w-[80px]">
                <button
                  onClick={() => { setDeleteTargetId(record.id); setIsDeleteModalOpen(true); }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4 text-gray-600" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <DeletePayrollRecordModal
        isOpen={isDeleteModalOpen}
        recordId={deleteTargetId}
        employeeName={targetRecord?.employeeName}
        periodLabel={periodLabel}
        isDeleting={isDeleting}
        onClose={() => { if (!isDeleting) { setIsDeleteModalOpen(false); setDeleteTargetId(null); } }}
        onConfirmDelete={async (id) => {
          // Close modal immediately while deletion proceeds
          setIsDeleting(true);
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
          try {
            await onDelete(id);
          } finally {
            setIsDeleting(false);
          }
        }}
      />
    </div>
  );
};

export default PayrollTable;

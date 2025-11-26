import React, { useMemo, useState } from 'react';
import { User, Edit, Trash2 } from "lucide-react";
import DeletePayrollRecordModal from '../../../modals/employee/DeletePayrollRecordModal';
import { useDateFormat } from '../../../context/DateFormatContext';
import EditPayrollDetailsModal from '../../../modals/employee/EditPayrollDetailsModal';
import Portal from '../../common/Portal';

interface Employee {
  id: number;
  name: string;
  empId: string;
  role: string;
  contact: string;
  status: string;
  lastLogin: string;
  address: string;
  salary: string;
  contactName: string;
  contactNumber: string;
  relationship: string;
  password: string;
}

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
  onUpdate: (id: number, updatedData: Omit<PayrollRecord, 'id' | 'netSalary'> & { netSalary: number }) => void; // Add this
  employees: Employee[]; // Add this
  headColor?: 'normal' | 'green' | 'red';
}

const PayrollTable: React.FC<PayrollTableProps> = ({ payrollRecords, isLoading, onDelete, onUpdate, employees, headColor = 'normal' }) => {
  const { formatDate } = useDateFormat();
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // In PayrollTable component, add state for edit modal
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const targetEditRecord = useMemo(() => {
    return payrollRecords.find(r => r.id === editTargetId) || null;
  }, [editTargetId, payrollRecords]);

  const targetRecord = useMemo(() => {
    return payrollRecords.find(r => r.id === deleteTargetId) || null;
  }, [deleteTargetId, payrollRecords]);

  const periodLabel = useMemo(() => {
    if (!targetRecord) return undefined;
    return `${targetRecord.month} ${targetRecord.year}`;
  }, [targetRecord]);
  if (isLoading) {
    return (
      <div className="border-2 border-[#E5E7EB] rounded-md min-h-[429px] max-h-[429px] overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <table className="table-fixed w-full">
          <thead className={`border-[#E5E7EB] border-b sticky top-0 z-10 ${headColor === 'green' ? 'bg-green-200' : headColor === 'red' ? 'bg-red-200' : 'bg-[#EDEDED]'}`}>
            <tr>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[220px]">Employee Name</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px]">Period</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px]">Basic Salary</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px]">Deductions</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px]">Net Salary</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[100px]">Status</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px]">Payment Date</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-[26px] px-6 w-[220px]">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse mr-3 flex-shrink-0"></div>
                    <div className="min-w-0">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm w-[120px]">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-4 px-6 text-sm w-[120px]">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-4 px-6 text-sm w-[120px]">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-4 px-6 text-sm w-[120px]">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-4 px-6 w-[100px]">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </td>
                <td className="py-4 px-6 text-sm w-[120px]">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-4 px-6 w-[80px]">
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (payrollRecords.length === 0) {
    return (
      <div className="overflow-x-auto border-2 border-[#E5E7EB] rounded-md min-h-[429px]">
        <table className="table-fixed w-full">
          <thead className={`border-[#E5E7EB] border-b sticky top-0 z-10 ${headColor === 'green' ? 'bg-green-200' : headColor === 'red' ? 'bg-red-200' : 'bg-[#EDEDED]'}`}>
            <tr>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[220px]">Employee Name</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px]">Period</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px]">Basic Salary</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px]">Deductions</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px]">Net Salary</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[100px]">Status</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px]">Payment Date</th>
              <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[80px]">Actions</th>
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
      <table className="table-fixed w-full">
        <thead className={`border-[#E5E7EB] border-b sticky top-0 z-10 ${headColor === 'green' ? 'bg-gradient-to-r from-green-100 via-green-400 to-green-100 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]' : headColor === 'red' ? 'bg-gradient-to-r from-red-100 via-red-400 to-red-100 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]' : 'bg-[#EDEDED]'}`}>
          <tr>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[220px]">Employee Name</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px]">Period</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px]">Basic Salary</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px]">Deductions</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px]">Net Salary</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[100px]">Status</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[120px]">Payment Date</th>
            <th className="py-4 px-6 text-gray-500 font-medium text-left text-sm w-[80px]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {payrollRecords.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="py-[26px] px-6 w-[220px]">
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
              <td className="py-4 px-6 text-sm w-[120px] text-gray-600">
                <div>
                  {record.month} {record.year}
                </div>
              </td>
              <td className="py-4 px-6 text-sm w-[120px]">
                <div>
                  ₱{(record.basicSalary ?? 0).toLocaleString()}
                </div>
              </td>
              <td className="py-4 px-6 text-sm w-[120px]">
                <div>
                  ₱{(record.deductions ?? 0).toLocaleString()}
                </div>
              </td>
              <td className="py-4 px-6 text-sm w-[120px]">
                <div>
                  ₱{(record.netSalary ?? 0).toLocaleString()}
                </div>
              </td>
              <td className="py-4 px-6 w-[100px]">
                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${record.status === 'Paid' ? 'bg-green-100 text-green-800' : record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {record.status}
                </span>
              </td>
              <td className="py-4 px-6 text-sm w-[120px]">
                <div>
                  {record.paymentDate ? formatDate(new Date(record.paymentDate)) : '-'}
                </div>
              </td>
              <td className="py-4 px-6 w-[80px]">
                <button
                  onClick={() => { setEditTargetId(record.id); setIsEditModalOpen(true); }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
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

      {isEditModalOpen && targetEditRecord && (
        <Portal>
          <div className="fixed inset-0 z-[1000] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              onClick={() => {
                setIsEditModalOpen(false);
                setEditTargetId(null);
              }}
            />
            <div className="relative z-[1010]">
              <EditPayrollDetailsModal
                payrollRecord={targetEditRecord}
                employees={employees}
                onClose={() => { 
                  setIsEditModalOpen(false); 
                  setEditTargetId(null); 
                }}
                onUpdatePayroll={(id, updatedData) => {
                  onUpdate(id, updatedData); 
                  setIsEditModalOpen(false);
                  setEditTargetId(null);
                }}
              />
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default PayrollTable;

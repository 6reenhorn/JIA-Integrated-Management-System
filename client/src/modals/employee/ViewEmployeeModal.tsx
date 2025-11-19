import React from 'react';
import type { Employee } from '../../types/employee_types';

interface ViewEmployeeModalProps {
  employee: Employee;
  onClose: () => void;
}

const ViewEmployeeModal: React.FC<ViewEmployeeModalProps> = ({ employee, onClose }) => {
  const contactLines = employee.contact.split('\n');

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-100 shadow-md rounded-md px-8 py-6 w-[60vw] max-h-[500px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2">
          <h3 className="text-[20px] font-bold">Employee Details</h3>
        </div>

        <div className="space-y-4">
          <div className='flex items-start justify-between gap-6'>
            {/* Basic Information */}
            <div className="shadow-md shadow-gray-200 rounded-md p-4 flex-1 h-[176px]">
              <h4 className="text-[16px] font-bold mb-3">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-bold text-gray-600">Employee ID</label>
                  <p className="text-[14px]">{employee.empId}</p>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-600">Name</label>
                  <p className="text-[14px]">{employee.name}</p>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-600">Role</label>
                  <p className="text-[14px]">{employee.role}</p>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-600">Status</label>
                  <p className="text-[14px]">{employee.status}</p>
                </div>
              </div>
            </div>
            {/* Contact Information */}
            <div className="shadow-md shadow-gray-200 rounded-md p-4 flex-1 h-[176px]">
              <h4 className="text-[16px] font-bold mb-3">Contact Information</h4>
              <div className="space-y-2 grid grid-cols-2">
                <div>
                  <label className="text-[12px] font-bold text-gray-600">Email</label>
                  <p className="text-[14px]">{contactLines[0] || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-600">Phone</label>
                  <p className="text-[14px]">{contactLines[1] || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-600">Address</label>
                  <p className="text-[14px] whitespace-pre-line">{contactLines.slice(2).join('\n') || employee.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className='flex justify-between gap-6'>
            {/* Work Information */}
            <div className="shadow-md shadow-gray-200 rounded-md p-4 flex-1 h-[176px]">
              <h4 className="text-[16px] font-bold mb-3">Work Information</h4>
              <div className="">
                <div>
                  <label className="text-[12px] font-bold text-gray-600">Salary</label>
                  <p className="text-[14px] mb-[16px]">{employee.salary}</p>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-600">Last Login</label>
                  <p className="text-[14px]">{employee.lastLogin}</p>
                </div>
              </div>
            </div>
            {/* Emergency Contact */}
            <div className="shadow-md shadow-gray-200 rounded-md p-4 flex-2 h-[176px]">
              <h4 className="text-[16px] font-bold mb-3">Emergency Contact</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-bold text-gray-600">Name</label>
                  <p className="text-[14px]">{employee.contactName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-600">Phone</label>
                  <p className="text-[14px]">{employee.contactNumber || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-[12px] font-bold text-gray-600">Relationship</label>
                  <p className="text-[14px]">{employee.relationship || 'N/A'}</p>
                </div>
              </div>
            </div>
            {/* Password */}
            <div className="shadow-md shadow-gray-200 rounded-md p-4 flex-1 h-[176px]">
              <h4 className="text-[16px] font-bold mb-3">Account Credentials</h4>
              <div className='h-[60%] flex flex-col justify-center gap-2'>
                <label className="text-[12px] font-bold text-gray-600">Password</label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={employee.password}
                    readOnly
                    className="text-[14px] border border-gray-300 rounded px-2 py-1 w-full bg-gray-50"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(employee.password)}
                    className="px-3 py-1 bg-[#02367B] border-2 border-[#1C4A9E] text-white rounded text-sm hover:bg-[#1C4A9E]"
                    title="Copy password"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeModal;
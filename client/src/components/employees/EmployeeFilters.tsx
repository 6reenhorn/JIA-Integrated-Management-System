import { Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface EmployeeFiltersProps {
  onAddStaff: () => void;
  roleFilter: string;
  statusFilter: string;
  onRoleChange: (role: string) => void;
  onStatusChange: (status: string) => void;
}

const EmployeeFilters = ({ onAddStaff, roleFilter, statusFilter, onRoleChange, onStatusChange }: EmployeeFiltersProps) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const toggleRoleDropdown = () => setIsRoleDropdownOpen(!isRoleDropdownOpen);
  const toggleStatusDropdown = () => setIsStatusDropdownOpen(!isStatusDropdownOpen);

  const handleRoleOptionClick = (role: string) => {
    onRoleChange(role);
    setIsRoleDropdownOpen(false);
  };

  const handleStatusOptionClick = (status: string) => {
    onStatusChange(status);
    setIsStatusDropdownOpen(false);
  };

  const roleOptions = ['All Roles', 'Manager', 'Admin', 'Sales Associate', 'Cashier', 'Maintenance'];
  const statusOptions = ['All Status', 'Active', 'Inactive'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items gap-4 my-5">
      <div className="dropdown relative" ref={roleDropdownRef}>
        <div
          className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 border-[#E5E7EB] rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer w-[145px] h-[36px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={toggleRoleDropdown}
        >
          {roleFilter}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={`transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`}
          >
            <polygon points="4,6 12,6 8,12" fill="currentColor" />
          </svg>
        </div>
        <div
          className="dropdown-options"
          style={{
            display: isRoleDropdownOpen ? 'block' : 'none',
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            zIndex: 10,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          {roleOptions.map((option) => (
            <div
              key={option}
              className="option px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleRoleOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
      <div className="dropdown relative" ref={statusDropdownRef}>
        <div
          className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 border-[#E5E7EB] rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer w-[145px] h-[36px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={toggleStatusDropdown}
        >
          {statusFilter}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={`transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
          >
            <polygon points="4,6 12,6 8,12" fill="currentColor" />
          </svg>
        </div>
        <div
          className="dropdown-options"
          style={{
            display: isStatusDropdownOpen ? 'block' : 'none',
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            zIndex: 10,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          {statusOptions.map((option) => (
            <div
              key={option}
              className="option px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleStatusOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={onAddStaff}
        className='flex items-center gap-2 text-[14px] h-[36px] bg-[#02367B] border-2 border-[#1C4A9E] rounded-lg px-4 py-2 text-white hover:bg-[#016CA5] focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0'
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Staff
      </button>
    </div>
  );
};

export default EmployeeFilters;

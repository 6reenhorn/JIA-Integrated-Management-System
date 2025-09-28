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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const toggleFilters = () => setIsFiltersOpen(!isFiltersOpen);
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
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsFiltersOpen(false);
      }
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
    <div className="flex justify-between items-center gap-4 my-5">
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={toggleFilters}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg viewBox="0 0 1000 1000" data-name="Layer 2" id="Layer_2" xmlns="http://www.w3.org/2000/svg" fill="#000000" className="w-5 h-5">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <defs><style>{`.cls-1{fill:none;stroke:#020202;stroke-linecap:round;stroke-miterlimit:10;stroke-width:22px;}`}</style></defs>
              <line className="cls-1" x1="184.63" x2="312.9" y1="292.84" y2="292.84"></line>
              <line className="cls-1" x1="541.67" x2="815.37" y1="292.84" y2="292.84"></line>
              <circle className="cls-1" cx="427.04" cy="292.84" r="70.46"></circle>
              <line className="cls-1" x1="815.37" x2="687.1" y1="499.06" y2="499.06"></line>
              <line className="cls-1" x1="458.33" x2="184.63" y1="499.06" y2="499.06"></line>
              <circle className="cls-1" cx="572.96" cy="499.06" r="70.46"></circle>
              <line className="cls-1" x1="815.37" x2="597.03" y1="707.16" y2="707.16"></line>
              <line className="cls-1" x1="368.26" x2="184.63" y1="707.16" y2="707.16"></line>
              <circle className="cls-1" cx="482.89" cy="707.16" r="70.46"></circle>
            </g>
          </svg>
          Custom Filters
        </button>
        {isFiltersOpen && (
          <div ref={filtersRef} className="absolute top-full mt-2 -right-[1px] z-10">
            <div className="bg-white p-4 rounded-md shadow-md flex flex-col gap-4">
              <div className="dropdown relative text-[15px]" ref={roleDropdownRef}>
                <div
                  className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 border-[#E5E7EB] rounded-md px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer w-[185px] h-[36px] focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="dropdown-options mt-1 rounded-md"
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
                      className="option text-[14px] px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleRoleOptionClick(option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
              <div className="dropdown relative text-[15px]" ref={statusDropdownRef}>
                <div
                  className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 border-[#E5E7EB] rounded-md px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer w-[185px] h-[36px] focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="dropdown-options mt-1 rounded-md"
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
                      className="option text-[14px] px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleStatusOptionClick(option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={onAddStaff}
        className='flex items-center gap-2 text-[14px] h-[36px] bg-[#02367B] border-2 border-[#1C4A9E] rounded-md px-4 py-2 text-white hover:bg-[#1C4A9E] focus:outline-none flex-shrink-0'
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Staff
      </button>
    </div>
  );
};

export default EmployeeFilters;

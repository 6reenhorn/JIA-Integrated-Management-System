import { Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface EmployeeFiltersProps {
  onAddStaff: () => void;
  roleFilter: string;
  statusFilter: string;
  onRoleChange: (role: string) => void;
  onStatusChange: (status: string) => void;
  onReset: () => void;
}

const EmployeeFilters = ({ onAddStaff, roleFilter, statusFilter, onRoleChange, onStatusChange, onReset }: EmployeeFiltersProps) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [, setRoleFocusIndex] = useState(0);
  const [, setStatusFocusIndex] = useState(0);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const roleOptionsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const statusOptionsRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggleFilters = () => {
    if (isFiltersOpen) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsFiltersOpen(false);
        setIsAnimating(false);
      }, 100);
    } else {
      setIsFiltersOpen(true);
    }
  };
  
  const toggleRoleDropdown = () => {
    setIsRoleDropdownOpen(!isRoleDropdownOpen);
    setRoleFocusIndex(-1);
  };
  
  const toggleStatusDropdown = () => {
    setIsStatusDropdownOpen(!isStatusDropdownOpen);
    setStatusFocusIndex(-1);
  };

  const handleRoleOptionClick = (role: string) => {
    onRoleChange(role);
    setIsRoleDropdownOpen(false);
    setRoleFocusIndex(-1);
  };

  const handleStatusOptionClick = (status: string) => {
    onStatusChange(status);
    setIsStatusDropdownOpen(false);
    setStatusFocusIndex(-1);
  };

  const roleOptions = ['All Roles', 'Admin', 'General Manager', 'Inventory Manager', 'E-Wallet Recorder', 'Inventory Transaction Manager'];
  const statusOptions = ['All Status', 'Active', 'Inactive'];

  // Handle role dropdown keyboard navigation
  const handleRoleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRoleDropdownOpen && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggleRoleDropdown();
      return;
    }

    if (!isRoleDropdownOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setRoleFocusIndex(prev => {
          const next = prev < roleOptions.length - 1 ? prev + 1 : 0;
          roleOptionsRefs.current[next]?.focus();
          return next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setRoleFocusIndex(prev => {
          const next = prev > 0 ? prev - 1 : roleOptions.length - 1;
          roleOptionsRefs.current[next]?.focus();
          return next;
        });
        break;
      case 'Escape':
        e.preventDefault();
        setIsRoleDropdownOpen(false);
        setRoleFocusIndex(-1);
        break;
    }
  };

  // Handle status dropdown keyboard navigation
  const handleStatusKeyDown = (e: React.KeyboardEvent) => {
    if (!isStatusDropdownOpen && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggleStatusDropdown();
      return;
    }

    if (!isStatusDropdownOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setStatusFocusIndex(prev => {
          const next = prev < statusOptions.length - 1 ? prev + 1 : 0;
          statusOptionsRefs.current[next]?.focus();
          return next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setStatusFocusIndex(prev => {
          const next = prev > 0 ? prev - 1 : statusOptions.length - 1;
          statusOptionsRefs.current[next]?.focus();
          return next;
        });
        break;
      case 'Escape':
        e.preventDefault();
        setIsStatusDropdownOpen(false);
        setStatusFocusIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        if (isFiltersOpen) {
          setIsAnimating(true);
          setTimeout(() => {
            setIsFiltersOpen(false);
            setIsAnimating(false);
          }, 100);
        }
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
        setRoleFocusIndex(-1);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
        setStatusFocusIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFiltersOpen]);

  return (
    <div className="flex justify-between items-center gap-4 my-5">
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={toggleFilters}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <svg viewBox="0 0 1000 1000" data-name="Layer 2" id="Layer_2" xmlns="http://www.w3.org/2000/svg" fill="#000000" className="w-5 h-5">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
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
          <div ref={filtersRef} className="absolute top-full mt-2 -right-[1px] z-50">
            <div className={`bg-white p-4 rounded-md shadow-md flex flex-col gap-2 ${isAnimating ? 'animate-dropdown-out' : 'animate-dropdown-in'}`}>
              <div className="dropdown relative text-[15px]" ref={roleDropdownRef}>
                <div
                  className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 border-[#E5E7EB] rounded-md px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer w-[185px] h-[36px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  onClick={toggleRoleDropdown}
                  onKeyDown={handleRoleKeyDown}
                  tabIndex={0}
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
                  className="dropdown-options mt-1 rounded-md focus:outline-none"
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
                  {roleOptions.map((option, index) => (
                    <div
                      key={option}
                      ref={el => {roleOptionsRefs.current[index] = el}}
                      className="option text-[14px] px-4 py-2 hover:bg-gray-100 cursor-pointer focus:outline-none focus-visible:bg-blue-50"
                      onClick={() => handleRoleOptionClick(option)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRoleOptionClick(option);
                        } else if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          const nextIndex = index < roleOptions.length - 1 ? index + 1 : 0;
                          roleOptionsRefs.current[nextIndex]?.focus();
                          setRoleFocusIndex(nextIndex);
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          const prevIndex = index > 0 ? index - 1 : roleOptions.length - 1;
                          roleOptionsRefs.current[prevIndex]?.focus();
                          setRoleFocusIndex(prevIndex);
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          setIsRoleDropdownOpen(false);
                          setRoleFocusIndex(-1);
                        }
                      }}
                      tabIndex={0}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
              <div className="dropdown relative text-[15px]" ref={statusDropdownRef}>
                <div
                  className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 border-[#E5E7EB] rounded-md px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer w-[185px] h-[36px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  onClick={toggleStatusDropdown}
                  onKeyDown={handleStatusKeyDown}
                  tabIndex={0}
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
                  {statusOptions.map((option, index) => (
                    <div
                      key={option}
                      ref={el => {statusOptionsRefs.current[index] = el}}
                      className="option text-[14px] px-4 py-2 hover:bg-gray-100 cursor-pointer focus:outline-none focus-visible:bg-blue-50"
                      onClick={() => handleStatusOptionClick(option)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleStatusOptionClick(option);
                        } else if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          const nextIndex = index < statusOptions.length - 1 ? index + 1 : 0;
                          statusOptionsRefs.current[nextIndex]?.focus();
                          setStatusFocusIndex(nextIndex);
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          const prevIndex = index > 0 ? index - 1 : statusOptions.length - 1;
                          statusOptionsRefs.current[prevIndex]?.focus();
                          setStatusFocusIndex(prevIndex);
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          setIsStatusDropdownOpen(false);
                          setStatusFocusIndex(-1);
                        }
                      }}
                      tabIndex={0}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={onReset}
                className="w-full text-sm px-4 mt-4 py-2 bg-gray-500 border-2 border-gray-600 text-white rounded-sm hover:bg-gray-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-600 flex-shrink-0"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={onAddStaff}
        className='flex items-center gap-2 text-[14px] py-2 bg-[#02367B] border-2 border-[#1C4A9E] rounded-md px-4 py-2 text-white hover:bg-[#1C4A9E] flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Staff
      </button>
    </div>
  );
};

export default EmployeeFilters;
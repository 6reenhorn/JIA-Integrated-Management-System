import { useState, useEffect, useRef } from 'react';
import type { Employee } from '../../types/employee_types';

interface EditStaffModalProps {
  employee: Employee;
  onClose: () => void;
  onSave: (updatedEmployee: Employee) => void;
}

const EditStaffDetailsModal: React.FC<EditStaffModalProps> = ({ employee, onClose, onSave }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [salary, setSalary] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [selectedStatusText, setSelectedStatusText] = useState('Select Status');
  const [selectedRoleText, setSelectedRoleText] = useState('Select Role');
  const [isRelationshipDropdownOpen, setIsRelationshipDropdownOpen] = useState(false);
  const [selectedRelationshipText, setSelectedRelationshipText] = useState('Select Relationship');
  const [focusedStatusOption, setFocusedStatusOption] = useState(0);
  const [focusedRoleOption, setFocusedRoleOption] = useState(0);
  const [focusedRelationshipOption, setFocusedRelationshipOption] = useState(0);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const relationshipDropdownRef = useRef<HTMLDivElement>(null);

      // Populate form fields when employee changes
      useEffect(() => {
        if (employee) {
          setFirstName(employee.name.split(' ')[0] || '');
          setLastName(employee.name.split(' ').slice(1).join(' ') || '');

          // Parse contact string (email\nphone\naddress)
          const contactParts = employee.contact.split('\n');
          setEmail(contactParts[0] || '');
          setPhone(contactParts[1] || '');
          setAddress(contactParts[2] || (employee as any).address || '123 Main Street, City, State, ZIP');

          setSalary((employee as any).salary || '50000');
          setContactName((employee as any).contactName || 'N/A');
          setContactNumber((employee as any).contactNumber || 'N/A');
          setSelectedStatusText(employee.status);
          setSelectedRoleText(employee.role);
          const relationshipText = (employee as any).relationship || 'Spouse';
          setSelectedRelationshipText(relationshipText);
        }
      }, [employee]);

  const toggleStatusDropdown = () => {
    setIsStatusDropdownOpen(!isStatusDropdownOpen);
    setIsRoleDropdownOpen(false);
    setIsRelationshipDropdownOpen(false);
  };

  const toggleRoleDropdown = () => {
    setIsRoleDropdownOpen(!isRoleDropdownOpen);
    setIsStatusDropdownOpen(false);
    setIsRelationshipDropdownOpen(false);
  };

  const handleStatusOptionClick = (text: string) => {
    setSelectedStatusText(text);
    setIsStatusDropdownOpen(false);
  };

  const handleRoleOptionClick = (_value: string, text: string) => {
    setSelectedRoleText(text);
    setIsRoleDropdownOpen(false);
  };

  const toggleRelationshipDropdown = () => {
    setIsRelationshipDropdownOpen(!isRelationshipDropdownOpen);
    setIsStatusDropdownOpen(false);
    setIsRoleDropdownOpen(false);
  };

  const handleRelationshipOptionClick = (_text: string) => {
    setSelectedRelationshipText(_text);
    setIsRelationshipDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (relationshipDropdownRef.current && !relationshipDropdownRef.current.contains(event.target as Node)) {
        setIsRelationshipDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedEmployee: Employee & {
      email: string;
      phone: string;
      address: string;
      salary: string;
      contactName: string;
      contactNumber: string;
      relationship: string;
    } = {
      ...employee,
      name: `${firstName} ${lastName}`,
      contact: `${email}\n${phone}\n${address}`,
      status: selectedStatusText as "Active" | "Inactive",
      role: selectedRoleText,
      email,
      phone,
      address,
      salary,
      contactName,
      contactNumber,
      relationship: selectedRelationshipText,
    };
    onSave(updatedEmployee);
  };

  return (
    <div className="bg-gray-100 shadow-md rounded-md p-6 w-[460px] max-h-[850px]">
      <div>
        <h3 className="text-[20px] font-bold">Edit Employee</h3>
        <p className="text-[12px]">Update the employee's information and role details.</p>
      </div>
      <div className="overflow-y-auto max-h-[680px] mt-4 text-[12px]">
        <form id="edit-employee-form" onSubmit={handleSubmit} className='flex flex-col gap-3'>
          <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4">
            <h3 className="text-[16px] font-bold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label htmlFor="edited_first_name" className="text-[12px] font-bold">First Name</label>
                <input type="text" name="edited_first_name" id="edited_first_name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
              </div>
              <div>
                <label htmlFor="edited_last_name" className="text-[12px] font-bold">Last Name</label>
                <input type="text" name="edited_last_name" id="edited_last_name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col justify-center">
                <label htmlFor="edited_email_address" className="text-[12px] font-bold">Email Address</label>
                <input type="text" id="edited_email_address" name="edited_email_address" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
              </div>
              <div className="flex flex-col justify-center">
                <label htmlFor="edited_phone_number" className="text-[12px] font-bold">Phone Number</label>
                <input type="text" id="edited_phone_number" name="edited_phone_number" value={phone} onChange={(e) => setPhone(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
              </div>
            </div>
            <div className="mt-2">
              <label htmlFor="employee_address" className="text-[12px] font-bold">Address</label>
              <textarea name="employee_address" id="employee_address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"></textarea>
            </div>
          </div>
          <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4 text-[12px]">
            <h3 className="text-[16px] font-bold">Work Information</h3>
            <div className='flex gap-4 text-[12px] relative mt-2'>
              <div className="dropdown relative" ref={statusDropdownRef}>
                <p className="text-[12px] font-bold">Status</p>
                <div
                  className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-md px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[29px]"
                  onClick={toggleStatusDropdown}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleStatusDropdown();
                      e.preventDefault();
                    }
                  }}
                  tabIndex={0}
                >
                  {selectedStatusText}
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
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setFocusedStatusOption((prev) => (prev + 1) % 2);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setFocusedStatusOption((prev) => (prev - 1 + 2) % 2);
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      if (focusedStatusOption === 0) {
                        handleStatusOptionClick('Active');
                      } else {
                        handleStatusOptionClick('Inactive');
                      }
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setIsStatusDropdownOpen(false);
                    }
                  }}
                  tabIndex={isStatusDropdownOpen ? 0 : -1}
                >
                  <div
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedStatusOption === 0 ? 'bg-blue-100' : ''}`}
                    data-value="active"
                    onClick={() => handleStatusOptionClick('Active')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleStatusOptionClick('Active');
                      }
                    }}
                    tabIndex={isStatusDropdownOpen ? 0 : -1}
                  >
                    Active
                  </div>
                  <div
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedStatusOption === 1 ? 'bg-blue-100' : ''}`}
                    data-value="inactive"
                    onClick={() => handleStatusOptionClick('Inactive')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleStatusOptionClick('Inactive');
                      }
                    }}
                    tabIndex={isStatusDropdownOpen ? 0 : -1}
                  >
                    Inactive
                  </div>
                </div>
              </div>
              <div className="dropdown relative" ref={roleDropdownRef}>
                <p className="text-[12px] font-bold">Role</p>
                <div
                  className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-md px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[29px]"
                  onClick={toggleRoleDropdown}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleRoleDropdown();
                      e.preventDefault();
                    }
                  }}
                  tabIndex={0}
                >
                  {selectedRoleText}
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
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setFocusedRoleOption((prev) => (prev + 1) % 5);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setFocusedRoleOption((prev) => (prev - 1 + 5) % 5);
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      const roles = [
                        { value: 'manager', text: 'Manager' },
                        { value: 'admin', text: 'Admin' },
                        { value: 'sales_associates', text: 'Sales Associate' },
                        { value: 'cashier', text: 'Cashier' },
                        { value: 'maintenance', text: 'Maintenance' }
                      ];
                      const selected = roles[focusedRoleOption];
                      handleRoleOptionClick(selected.value, selected.text);
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setIsRoleDropdownOpen(false);
                    }
                  }}
                  tabIndex={isRoleDropdownOpen ? 0 : -1}
                >
                  <div
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRoleOption === 0 ? 'bg-blue-100' : ''}`}
                    data-value="manager"
                    onClick={() => handleRoleOptionClick('manager', 'Manager')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRoleOptionClick('manager', 'Manager');
                      }
                    }}
                    tabIndex={isRoleDropdownOpen ? 0 : -1}
                  >
                    Manager
                  </div>
                  <div
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRoleOption === 1 ? 'bg-blue-100' : ''}`}
                    data-value="admin"
                    onClick={() => handleRoleOptionClick('admin', 'Admin')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRoleOptionClick('admin', 'Admin');
                      }
                    }}
                    tabIndex={isRoleDropdownOpen ? 0 : -1}
                  >
                    Admin
                  </div>
                  <div
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRoleOption === 2 ? 'bg-blue-100' : ''}`}
                    data-value="sales_associates"
                    onClick={() => handleRoleOptionClick('sales_associates', 'Sales Associate')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRoleOptionClick('sales_associates', 'Sales Associate');
                      }
                    }}
                    tabIndex={isRoleDropdownOpen ? 0 : -1}
                  >
                    Sales Associate
                  </div>
                  <div
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRoleOption === 3 ? 'bg-blue-100' : ''}`}
                    data-value="cashier"
                    onClick={() => handleRoleOptionClick('cashier', 'Cashier')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRoleOptionClick('cashier', 'Cashier');
                      }
                    }}
                    tabIndex={isRoleDropdownOpen ? 0 : -1}
                  >
                    Cashier
                  </div>
                  <div
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRoleOption === 4 ? 'bg-blue-100' : ''}`}
                    data-value="maintenance"
                    onClick={() => handleRoleOptionClick('maintenance', 'Maintenance')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRoleOptionClick('maintenance', 'Maintenance');
                      }
                    }}
                    tabIndex={isRoleDropdownOpen ? 0 : -1}
                  >
                    Maintenance
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-2'>
              <label htmlFor="employee-salary" className='text-[12px] font-bold'>Salary</label>
              <input type="text" id='employee-salary' name='employee-salary' value={salary} onChange={(e) => setSalary(e.target.value)} className="border border-gray-300 rounded-md w-full px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
            </div>
          </div>
          <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4 text-[12px]">
            <h3 className="text-[16px] font-bold">Emergency Contact (Optional)</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col justify-center">
                <label htmlFor="employee_contact_name" className="text-[12px] font-bold">Contact Name</label>
                <input type="text" id="employee_contact_name" name="employee_contact_name" value={contactName} onChange={(e) => setContactName(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
              </div>
              <div>
                <label htmlFor="employee_contact_number" className="text-[12px] font-bold">Phone Number</label>
                <input type="text" id="employee_contact_number" name="employee_contact_number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none w-full" />
              </div>
            </div>
            <div className='mt-2 w-full'>
              <div className="dropdown relative" ref={relationshipDropdownRef}>
                <p className="text-[12px] font-bold">Relationship</p>
                <div
                  className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-md px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[29px]"
                  onClick={toggleRelationshipDropdown}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleRelationshipDropdown();
                      e.preventDefault();
                    }
                  }}
                  tabIndex={0}
                >
                  {selectedRelationshipText}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`transition-transform ${isRelationshipDropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <polygon points="4,6 12,6 8,12" fill="currentColor" />
                  </svg>
                </div>
                <div
                  className="dropdown-options -mt-1 rounded-md"
                  style={{
                    display: isRelationshipDropdownOpen ? 'block' : 'none',
                    position: 'absolute',
                    top: '-370%',
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
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setFocusedRelationshipOption((prev) => (prev + 1) % 5);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setFocusedRelationshipOption((prev) => (prev - 1 + 5) % 5);
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      const relationships = [
                        { value: 'spouse', text: 'Spouse' },
                        { value: 'parent', text: 'Parent' },
                        { value: 'sibling', text: 'Sibling' },
                        { value: 'friend', text: 'Friend' },
                        { value: 'other', text: 'Other' }
                      ];
                      const selected = relationships[focusedRelationshipOption];
                      handleRelationshipOptionClick(selected.text);
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setIsRelationshipDropdownOpen(false);
                    }
                  }}
                  tabIndex={isRelationshipDropdownOpen ? 0 : -1}
                >
                  <div
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRelationshipOption === 0 ? 'bg-blue-100' : ''}`}
                    data-value="spouse"
                    onClick={() => handleRelationshipOptionClick('Spouse')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRelationshipOptionClick('Spouse');
                      }
                    }}
                    tabIndex={isRelationshipDropdownOpen ? 0 : -1}
                  >
                    Spouse
                  </div>
                  <div
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRelationshipOption === 1 ? 'bg-blue-100' : ''}`}
                    data-value="parent"
                    onClick={() => handleRelationshipOptionClick('Parent')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRelationshipOptionClick('Parent');
                      }
                    }}
                    tabIndex={isRelationshipDropdownOpen ? 0 : -1}
                  >
                    Parent
                  </div>
                  <div
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRelationshipOption === 2 ? 'bg-blue-100' : ''}`}
                    data-value="sibling"
                    onClick={() => handleRelationshipOptionClick('Sibling')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRelationshipOptionClick('Sibling');
                      }
                    }}
                    tabIndex={isRelationshipDropdownOpen ? 0 : -1}
                  >
                    Sibling
                  </div>
                  <div
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRelationshipOption === 3 ? 'bg-blue-100' : ''}`}
                    data-value="friend"
                    onClick={() => handleRelationshipOptionClick('Friend')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRelationshipOptionClick('Friend');
                      }
                    }}
                    tabIndex={isRelationshipDropdownOpen ? 0 : -1}
                  >
                    Friend
                  </div>
                  <div
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRelationshipOption === 4 ? 'bg-blue-100' : ''}`}
                    data-value="other"
                    onClick={() => handleRelationshipOptionClick('Other')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRelationshipOptionClick('Other');
                      }
                    }}
                    tabIndex={isRelationshipDropdownOpen ? 0 : -1}
                  >
                    Other
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
        <div className="w-full flex justify-end gap-2 mt-4 text-[12px] font-bold">
          <button
            onClick={onClose}
            className="border border-gray-300 hover:bg-gray-200 rounded-md px-3 py-1">
            Cancel
          </button>
          <button type="submit" form="edit-employee-form" className="border border-gray-300 rounded-md px-3 py-1 bg-[#02367B] hover:bg-[#1C4A9E] text-white">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStaffDetailsModal;
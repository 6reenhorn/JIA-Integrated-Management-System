import { useState, useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [nameError, setNameError] = useState('');
  const [contactNameError, setContactNameError] = useState('');
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const relationshipDropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

      // Populate form fields when employee changes
      useEffect(() => {
        if (employee) {
          // Use firstName/lastName if available, otherwise split the name
          if ((employee as any).firstName && (employee as any).lastName) {
            setFirstName((employee as any).firstName);
            setLastName((employee as any).lastName);
          } else {
            // Fallback: split name on last space (first part = firstName, last word = lastName)
            const nameParts = employee.name.trim().split(/\s+/);
            if (nameParts.length === 1) {
              setFirstName(nameParts[0] || '');
              setLastName('');
            } else {
              // First part is firstName, last word is lastName
              setFirstName(nameParts.slice(0, -1).join(' ') || '');
              setLastName(nameParts[nameParts.length - 1] || '');
            }
          }

          // Parse contact string (email\nphone\naddress)
          const contactParts = employee.contact.split('\n');
          setEmail(contactParts[0] || '');
          setPhone(contactParts[1] || '');
          setAddress(contactParts[2] || (employee as any).address || '123 Main Street, City, State, ZIP');

          setSalary(String((employee as any).salary || '50000'));
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

  const handleClose = () => {
    if (!isClosing) {
      setIsClosing(true);
      setShowValidationAlert(false);
      setMissingFields([]);
      setFieldErrors({});
    }
  };

  const handleAnimationEnd = () => {
    if (isClosing) {
      onClose();
    }
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

  // Validate name fields - no numbers allowed
  const validateName = (name: string): boolean => {
    return /^[a-zA-Z\s'-]+$/.test(name.trim());
  };

  // Validate phone number - must be numeric
  const validatePhone = (phone: string): boolean => {
    const phoneStr = String(phone || '').trim();
    if (phoneStr === '' || phoneStr.toUpperCase() === 'N/A') return true; // Empty or N/A is OK, we only validate when there's actual input
    return /^[0-9+\-\s()]+$/.test(phoneStr);
  };

  // Validate salary - must be numeric
  const validateSalary = (salary: string | number): boolean => {
    const salaryStr = String(salary || '');
    if (salaryStr.trim() === '') return true; // Empty is OK, we only validate when there's input
    // Allow numbers, decimal point, and commas
    return /^[0-9,.\s]+$/.test(salaryStr.trim()) && !isNaN(parseFloat(salaryStr.replace(/,/g, '')));
  };

  // Real-time validation - runs whenever any field changes
  // Only shows alert for invalid input (not empty fields)
  useEffect(() => {
    const invalidFields: string[] = [];
    const errors: Record<string, boolean> = {};

    // Track name errors for internal use (not displayed)
    if (firstName.trim() !== '' && !validateName(firstName)) {
      setNameError('First name cannot contain numbers');
      invalidFields.push('First Name (contains numbers)');
      errors.firstName = true;
    } else {
      setNameError('');
    }

    if (lastName.trim() !== '' && !validateName(lastName)) {
      setNameError('Last name cannot contain numbers');
      invalidFields.push('Last Name (contains numbers)');
      errors.lastName = true;
    } else if (!errors.firstName) {
      setNameError('');
    }

    // Validate Contact Name - only check if there's input (not empty or N/A)
    if (contactName.trim() !== '' && contactName.trim().toUpperCase() !== 'N/A' && !validateName(contactName)) {
      setContactNameError('Contact name cannot contain numbers');
      invalidFields.push('Contact Name (contains numbers)');
      errors.contactName = true;
    } else {
      setContactNameError('');
    }

    // Validate phone - only check if there's input (not empty or N/A)
    const phoneStr = String(phone || '').trim();
    if (phoneStr !== '' && phoneStr.toUpperCase() !== 'N/A' && !validatePhone(phoneStr)) {
      invalidFields.push('Phone Number (must be numeric)');
      errors.phone = true;
    }

    // Validate Contact Number (Emergency Contact Phone) - only check if there's input (not empty or N/A)
    const contactNumberStr = String(contactNumber || '').trim();
    if (contactNumberStr !== '' && contactNumberStr.toUpperCase() !== 'N/A' && !validatePhone(contactNumberStr)) {
      invalidFields.push('Contact Number (must be numeric)');
      errors.contactNumber = true;
    }

    // Validate salary - only check if there's input
    const salaryStr = String(salary || '');
    if (salaryStr.trim() !== '' && !validateSalary(salaryStr)) {
      invalidFields.push('Salary (must be numeric)');
      errors.salary = true;
    }

    // Update field errors
    setFieldErrors(errors);

    // Show/hide validation alert based on invalid input only (exclude optional Contact Name)
    if (invalidFields.length > 0) {
      setMissingFields(invalidFields);
      setShowValidationAlert(true);
    } else {
      setShowValidationAlert(false);
      setMissingFields([]);
    }
  }, [firstName, lastName, contactName, phone, salary, contactNumber]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate names
    if (!validateName(firstName)) {
      setNameError('First name cannot contain numbers');
      return;
    }
    if (!validateName(lastName)) {
      setNameError('Last name cannot contain numbers');
      return;
    }
    if (contactName.trim() !== '' && !validateName(contactName)) {
      setContactNameError('Contact name cannot contain numbers');
      return;
    }

    // Validate phone and salary
    if (phone.trim() !== '' && !validatePhone(phone)) {
      return;
    }
    const salaryStr = String(salary || '');
    if (salaryStr.trim() !== '' && !validateSalary(salaryStr)) {
      return;
    }

    setNameError('');
    setContactNameError('');

    if (isSaving) return;
    setIsSaving(true);

    try {
      const updatedEmployee = {
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

      await onSave(updatedEmployee);

      setIsClosing(true);

    } catch (err) {
      console.error('Failed to save employee:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Validation Alert - Absolutely positioned beside modal, doesn't affect modal layout */}
      {showValidationAlert && (
        <div className="absolute w-[300px] bg-red-50 border border-red-200 rounded-lg p-3 animate-modal-in z-50" style={{ left: 'calc(50% + 250px)', top: '15%', transform: 'translateY(-50%)' }}>
          <div className="flex gap-2">
            <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-800 mb-1">
                Invalid input detected
              </p>
              <p className="text-xs text-red-700">
                {missingFields.join(', ')}
              </p>
            </div>
            <button
              onClick={() => setShowValidationAlert(false)}
              className="text-red-600 hover:text-red-800"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div
        ref={modalRef}
        className={`bg-gray-100 shadow-md rounded-md p-6 w-[460px] max-h-[850px] relative z-10 ${
          isClosing ? 'animate-modal-out' : 'animate-modal-in'
        }`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
      >
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
                <input 
                  type="text" 
                  name="edited_first_name" 
                  id="edited_first_name" 
                  value={firstName} 
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setNameError('');
                  }} 
                  className={`w-full border rounded-md px-2 py-1 focus:ring-2 focus:outline-none ${
                    fieldErrors.firstName
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-300' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`} 
                />
              </div>
              <div>
                <label htmlFor="edited_last_name" className="text-[12px] font-bold">Last Name</label>
                <input 
                  type="text" 
                  name="edited_last_name" 
                  id="edited_last_name" 
                  value={lastName} 
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setNameError('');
                  }} 
                  className={`w-full border rounded-md px-2 py-1 focus:ring-2 focus:outline-none ${
                    fieldErrors.lastName
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-300' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col justify-center">
                <label htmlFor="edited_email_address" className="text-[12px] font-bold">Email Address</label>
                <input type="text" id="edited_email_address" name="edited_email_address" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="flex flex-col justify-center">
                <label htmlFor="edited_phone_number" className="text-[12px] font-bold">Phone Number</label>
                <input 
                  type="text" 
                  id="edited_phone_number" 
                  name="edited_phone_number" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className={`border rounded-md px-2 py-1 focus:ring-2 focus:outline-none ${
                    fieldErrors.phone
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-300' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>
            </div>
            <div className="mt-2">
              <label htmlFor="employee_address" className="text-[12px] font-bold">Address</label>
              <textarea name="employee_address" id="employee_address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
            </div>
          </div>
          <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4 text-[12px]">
            <h3 className="text-[16px] font-bold">Work Information</h3>
            <div className='flex gap-4 text-[12px] relative mt-2'>
              <div className="dropdown relative" ref={statusDropdownRef}>
                <p className="text-[12px] font-bold">Status</p>
                <div
                  className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-md px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[29px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => {
                    toggleStatusDropdown();
                    if (!isStatusDropdownOpen) {
                      setTimeout(() => {
                        document.getElementById('status-dropdown-options')?.focus();
                      }, 0);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleStatusDropdown();
                      e.preventDefault();
                      if (!isStatusDropdownOpen) {
                        setTimeout(() => {
                          document.getElementById('status-dropdown-options')?.focus();
                        }, 0);
                      }
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
                  id="status-dropdown-options"
                  className="dropdown-options mt-1 rounded-md focus:outline-none"
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
                  className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-md px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[29px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => {
                    toggleRoleDropdown();
                    if (!isRoleDropdownOpen) {
                      setTimeout(() => {
                        document.getElementById('role-dropdown-options')?.focus();
                      }, 0);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleRoleDropdown();
                      e.preventDefault();
                      if (!isRoleDropdownOpen) {
                        setTimeout(() => {
                          document.getElementById('role-dropdown-options')?.focus();
                        }, 0);
                      }
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
                  id="role-dropdown-options"
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
                        { value: 'admin', text: 'Admin' },
                        { value: 'general_manager', text: 'General Manager' },
                        { value: 'inventory_manager', text: 'Inventory Manager' },
                        { value: 'e_wallet_recorder', text: 'E-Wallet Recorder' },
                        { value: 'inventory_transaction_manager', text: 'Inventory Transaction Manager' }
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
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRoleOption === 1 ? 'bg-blue-100' : ''}`}
                    data-value="general_manager"
                    onClick={() => handleRoleOptionClick('general_manager', 'General Manager')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRoleOptionClick('general_manager', 'General Manager');
                      }
                    }}
                    tabIndex={isRoleDropdownOpen ? 0 : -1}
                  >
                    General Manager
                  </div>
                  <div
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRoleOption === 2 ? 'bg-blue-100' : ''}`}
                    data-value="inventory_manager"
                    onClick={() => handleRoleOptionClick('inventory_manager', 'Inventory Manager')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRoleOptionClick('inventory_manager', 'Inventory Manager');
                      }
                    }}
                    tabIndex={isRoleDropdownOpen ? 0 : -1}
                  >
                    Inventory Manager
                  </div>
                  <div
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRoleOption === 3 ? 'bg-blue-100' : ''}`}
                    data-value="e_wallet_recorder"
                    onClick={() => handleRoleOptionClick('e_wallet_recorder', 'E-Wallet Recorder')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRoleOptionClick('e_wallet_recorder', 'E-Wallet Recorder');
                      }
                    }}
                    tabIndex={isRoleDropdownOpen ? 0 : -1}
                  >
                    E-Wallet Recorder
                  </div>
                  <div
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRoleOption === 4 ? 'bg-blue-100' : ''}`}
                    data-value="inventory_transaction_manager"
                    onClick={() => handleRoleOptionClick('inventory_transaction_manager', 'Inventory Transaction Manager')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRoleOptionClick('inventory_transaction_manager', 'Inventory Transaction Manager');
                      }
                    }}
                    tabIndex={isRoleDropdownOpen ? 0 : -1}
                  >
                    Inventory Transaction Manager
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-2'>
              <label htmlFor="employee-salary" className='text-[12px] font-bold'>Salary</label>
              <input 
                type="text" 
                id='employee-salary' 
                name='employee-salary' 
                value={salary} 
                onChange={(e) => setSalary(e.target.value)} 
                className={`border rounded-md w-full px-2 py-1 focus:ring-2 focus:outline-none ${
                  fieldErrors.salary
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-300' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
            </div>
          </div>
          <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4 text-[12px]">
            <h3 className="text-[16px] font-bold">Emergency Contact (Optional)</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col justify-center">
                <label htmlFor="employee_contact_name" className="text-[12px] font-bold">Contact Name</label>
                <input 
                  type="text" 
                  id="employee_contact_name" 
                  name="employee_contact_name" 
                  value={contactName} 
                  onChange={(e) => {
                    setContactName(e.target.value);
                    setContactNameError('');
                  }} 
                  className={`border rounded-md px-2 py-1 focus:ring-2 focus:outline-none ${
                    fieldErrors.contactName
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-300' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>
              <div>
                <label htmlFor="employee_contact_number" className="text-[12px] font-bold">Phone Number</label>
                <input 
                  type="text" 
                  id="employee_contact_number" 
                  name="employee_contact_number" 
                  value={contactNumber} 
                  onChange={(e) => setContactNumber(e.target.value)} 
                  className={`border rounded-md px-2 py-1 focus:ring-2 focus:outline-none w-full ${
                    fieldErrors.contactNumber
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-300' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>
            </div>
            <div className='mt-2 w-full'>
              <div className="dropdown relative" ref={relationshipDropdownRef}>
                <p className="text-[12px] font-bold">Relationship</p>
                <div
                  className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-md px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[29px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => {
                    toggleRelationshipDropdown();
                    if (!isRelationshipDropdownOpen) {
                      setTimeout(() => {
                        document.getElementById('relationship-dropdown-options')?.focus();
                      }, 0);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleRelationshipDropdown();
                      e.preventDefault();
                      if (!isRelationshipDropdownOpen) {
                        setTimeout(() => {
                          document.getElementById('relationship-dropdown-options')?.focus();
                        }, 0);
                      }
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
                  id="relationship-dropdown-options"
                  className="dropdown-options -mt-1 rounded-md focus:outline-none"
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
          onClick={handleClose}
          type="button"
          className="border border-gray-300 hover:bg-gray-200 rounded-md px-3 py-1"
        >
          Cancel
        </button>
          <button 
            type="button"
            className={`border border-gray-300 rounded-md px-3 py-1 text-white ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#02367B] hover:bg-[#1C4A9E]'}`} 
            disabled={isSaving}
            onClick={(e) => {
              // Ensure form submission works on mobile devices
              e.preventDefault();
              if (!isSaving) {
                const form = document.getElementById('edit-employee-form') as HTMLFormElement;
                if (form) {
                  // Trigger form submission
                  const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                  form.dispatchEvent(submitEvent);
                }
              }
            }}
          >
            {isSaving ? 'Updating...' : 'Update Employee'}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default EditStaffDetailsModal;
import { useState, useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Employee } from '../../types/employee_types';

interface AddStaffModalProps {
  onClose?: () => void;
  onAddEmployee?: (employee: Omit<Employee, 'id' | 'empId' | 'lastLogin'> & { address: string; salary: string; contactName: string; contactNumber: string; relationship: string; password: string }) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  salary: string;
  setSalary: (value: string) => void;
  contactName: string;
  setContactName: (value: string) => void;
  contactNumber: string;
  setContactNumber: (value: string) => void;
  selectedRoleText: string;
  setSelectedRoleText: (value: string) => void;
  selectedStatus: 'Active' | 'Inactive';
  setSelectedStatus: (value: 'Active' | 'Inactive') => void;
  selectedRelationshipText: string;
  setSelectedRelationshipText: (value: string) => void;
  onResetForm: () => void;
}

const AddStaffModal = ({
  onClose,
  onAddEmployee,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  phone,
  setPhone,
  address,
  setAddress,
  salary,
  setSalary,
  contactName,
  setContactName,
  contactNumber,
  setContactNumber,
  selectedRoleText,
  setSelectedRoleText,
  selectedStatus,
  setSelectedStatus,
  selectedRelationshipText,
  setSelectedRelationshipText,
  onResetForm
}: AddStaffModalProps) => {
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [selectedStatusText, setSelectedStatusText] = useState(selectedStatus === 'Active' ? 'Active' : 'Inactive');
  const [isRelationshipDropdownOpen, setIsRelationshipDropdownOpen] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
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

  const handleStatusOptionClick = (value: 'Active' | 'Inactive', text: string) => {
    setSelectedStatus(value);
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

  const handleRelationshipOptionClick = (_value: string, text: string) => {
    setSelectedRelationshipText(text);
    setIsRelationshipDropdownOpen(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    setShowValidationAlert(false);
    setMissingFields([]);
    setFieldErrors({});
    setTimeout(() => {
      setIsClosing(false);
      onClose?.();
    }, 100);
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
  const validateSalary = (salary: string): boolean => {
    if (salary.trim() === '') return true; // Empty is OK, we only validate when there's input
    // Allow numbers, decimal point, and commas
    return /^[0-9,.\s]+$/.test(salary.trim()) && !isNaN(parseFloat(salary.replace(/,/g, '')));
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
    if (salary.trim() !== '' && !validateSalary(salary)) {
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

    // Update form validity (still checks all required fields)
    const firstNameValid = firstName.trim() !== '' && validateName(firstName);
    const lastNameValid = lastName.trim() !== '' && validateName(lastName);
    const contactNameValid = contactName.trim() === '' || validateName(contactName);
    const phoneValid = phone.trim() === '' || validatePhone(phone);
    const salaryValid = salary.trim() === '' || validateSalary(salary);
    
    const valid = firstNameValid && lastNameValid && contactNameValid && phoneValid && salaryValid &&
                  email.trim() !== '' && phone.trim() !== '' && 
                  address.trim() !== '' && salary.trim() !== '' && 
                  selectedRoleText !== 'Select Role' && selectedStatusText !== 'Select Status';
    setIsFormValid(valid);
  }, [firstName, lastName, contactName, email, phone, address, salary, selectedRoleText, selectedStatusText, contactNumber]);

  const validateForm = (): boolean => {
    const missing: string[] = [];
    const errors: Record<string, boolean> = {};

    // Check for name validation errors first
    const firstNameValid = firstName.trim() !== '' && validateName(firstName);
    const lastNameValid = lastName.trim() !== '' && validateName(lastName);
    const contactNameValid = contactName.trim() === '' || validateName(contactName);

    if (!firstNameValid) {
      missing.push('First Name');
      errors.firstName = true;
    }
    if (!lastNameValid) {
      missing.push('Last Name');
      errors.lastName = true;
    }
    if (!email.trim()) {
      missing.push('Email Address');
      errors.email = true;
    }
    if (!phone.trim()) {
      missing.push('Phone Number');
      errors.phone = true;
    }
    if (!address.trim()) {
      missing.push('Address');
      errors.address = true;
    }
    if (!salary.trim()) {
      missing.push('Salary');
      errors.salary = true;
    }
    if (selectedRoleText === 'Select Role') {
      missing.push('Role');
      errors.role = true;
    }
    if (selectedStatusText === 'Select Status') {
      missing.push('Status');
      errors.status = true;
    }
    if (contactName.trim() && !contactNameValid) {
      missing.push('Contact Name (invalid format)');
      errors.contactName = true;
    }

    setFieldErrors(errors);

    // Note: Real-time validation is handled in the useEffect above
    // This function is kept for form submission validation
    if (missing.length > 0) {
      setMissingFields(missing);
      setShowValidationAlert(true);
      return false;
    }

    return true;
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
      >
      <div>
        <h3 className="text-[20px] font-bold">Add New Employee</h3>
        <p className="text-[12px]">Add a new team member to your organization with their details and role.</p>
      </div>
      <div className="overflow-y-auto max-h-[650px] mt-4 text-[12px]">
        <form action="submit" className='flex flex-col gap-3'>
          <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4">
            <h3 className="text-[16px] font-bold">Basic Information</h3>
            <div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col justify-center">
                  <label htmlFor="employee_first_name" className="text-[12px] font-bold">First Name</label>
                  <input 
                    type="text" 
                    id="employee_first_name" 
                    name="employee_first_name" 
                    placeholder='Enter first name' 
                    value={firstName} 
                    onChange={(e) => {
                      setFirstName(e.target.value);
                    }} 
                    className={`border rounded-md px-2 py-1 focus:ring-2 focus:outline-none ${
                      fieldErrors.firstName
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-300' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`} 
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <label htmlFor="employee_last_name" className="text-[12px] font-bold">Last Name</label>
                  <input 
                    type="text" 
                    id="employee_last_name" 
                    name="employee_last_name" 
                    placeholder='Enter last name' 
                    value={lastName} 
                    onChange={(e) => {
                      setLastName(e.target.value);
                    }} 
                    className={`border rounded-md px-2 py-1 focus:ring-2 focus:outline-none ${
                      fieldErrors.lastName
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-300' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col justify-center">
                  <label htmlFor="employee_email_address" className="text-[12px] font-bold">Email Address</label>
                  <input 
                    type="text" 
                    id="employee_email_address" 
                    name="employee_email_address" 
                    placeholder='Enter email address' 
                    value={email} 
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }} 
                    className="border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <label htmlFor="employee_phone_number" className="text-[12px] font-bold">Phone Number</label>
                  <input 
                    type="text" 
                    id="employee_phone_number" 
                    name="employee_phone_number" 
                    placeholder='Enter phone number' 
                    value={phone} 
                    onChange={(e) => {
                      setPhone(e.target.value);
                    }} 
                    className={`border rounded-md px-2 py-1 focus:ring-2 focus:outline-none ${
                      fieldErrors.phone
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-300' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                </div>
              </div>
              <div className='mt-2'>
                <label htmlFor="employee_address" className="text-[12px] font-bold">Address</label>
                <textarea 
                  name="employee_address" 
                  id="employee_address" 
                  placeholder='Enter complete address' 
                  value={address} 
                  onChange={(e) => {
                    setAddress(e.target.value);
                  }} 
                  className="w-full border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>
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
                        document.getElementById("status-options")?.focus();
                      }, 0);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      toggleStatusDropdown();
                      e.preventDefault();
                      if (!isStatusDropdownOpen) {
                        setTimeout(() => {
                          document.getElementById("status-options")?.focus();
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
                    className={`transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`}
                  >
                    <polygon points="4,6 12,6 8,12" fill="currentColor" />
                  </svg>
                </div>

                <div
                  id="status-options"
                  className="dropdown-options mt-1 rounded-md focus:outline-none"
                  style={{
                    display: isStatusDropdownOpen ? "block" : "none",
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    zIndex: 10,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setFocusedStatusOption((prev) => (prev + 1) % 2);
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setFocusedStatusOption((prev) => (prev - 1 + 2) % 2);
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      if (focusedStatusOption === 0) {
                        handleStatusOptionClick("Active", "Active");
                      } else {
                        handleStatusOptionClick("Inactive", "Inactive");
                      }
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      setIsStatusDropdownOpen(false);
                    }
                  }}
                  tabIndex={isStatusDropdownOpen ? 0 : -1}
                >
                  <div
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                      focusedStatusOption === 0 ? "bg-blue-50" : ""
                    }`}
                    data-value="Active"
                    onClick={() => handleStatusOptionClick("Active", "Active")}
                  >
                    Active
                  </div>
                  <div
                    className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                      focusedStatusOption === 1 ? "bg-blue-50" : ""
                    }`}
                    data-value="Inactive"
                    onClick={() => handleStatusOptionClick("Inactive", "Inactive")}
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
                        document.getElementById("role-options")?.focus();
                      }, 0);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleRoleDropdown();
                      e.preventDefault();
                      if (!isRoleDropdownOpen) {
                        setTimeout(() => {
                          document.getElementById("role-options")?.focus();
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
                  id="role-options"
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
                      const roleOptions = [
                        { value: 'admin', text: 'Admin' },
                        { value: 'general_manager', text: 'General Manager' },
                        { value: 'inventory_manager', text: 'Inventory Manager' },
                        { value: 'e_wallet_recorder', text: 'E-Wallet Recorder' },
                        { value: 'inventory_transaction_manager', text: 'Inventory Transaction Manager' }
                      ];
                      const selected = roleOptions[focusedRoleOption];
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
                    data-value="inventory_transaction_officer"
                    onClick={() => handleRoleOptionClick('inventory_transaction_officer', 'Inventory Transaction Officer')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRoleOptionClick('inventory_transaction_officer', 'Inventory Transaction Officer');
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
                placeholder='Enter salary' 
                value={salary} 
                onChange={(e) => {
                  setSalary(e.target.value);
                }} 
                className={`border rounded-md w-full px-2 py-1 focus:ring-2 focus:outline-none ${
                  fieldErrors.salary
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-300' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`} 
              />
            </div>
          </div>
          <div>
            <div className="shadow-md shadow-gray-200 rounded-md m-1 p-4 text-[12px]">
              <h3 className="text-[16px] font-bold">Emergency Contact (Optional)</h3>
              <div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col justify-center">
                    <label htmlFor="employee_contact_name" className="text-[12px] font-bold">Contact Name</label>
                    <input 
                      type="text" 
                      id="employee_contact_name" 
                      name="employee_contact_name" 
                      placeholder="Enter contact name" 
                      value={contactName} 
                      onChange={(e) => {
                        setContactName(e.target.value);
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
                      placeholder="Enter phone number" 
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
                            document.getElementById("relationship-options")?.focus();
                          }, 0);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          toggleRelationshipDropdown();
                          e.preventDefault();
                          if (!isRelationshipDropdownOpen) {
                            setTimeout(() => {
                              document.getElementById("relationship-options")?.focus();
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
                      id="relationship-options"
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
                          const relationshipOptions = [
                            { value: 'spouse', text: 'Spouse' },
                            { value: 'parent', text: 'Parent' },
                            { value: 'sibling', text: 'Sibling' },
                            { value: 'friend', text: 'Friend' },
                            { value: 'other', text: 'Other' }
                          ];
                          const selected = relationshipOptions[focusedRelationshipOption];
                          handleRelationshipOptionClick(selected.value, selected.text);
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          setIsRelationshipDropdownOpen(false);
                        }
                      }}
                      tabIndex={isRelationshipDropdownOpen ? 0 : -1}
                    >
                      <div
                        className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRelationshipOption === 0 ? 'bg-blue-50' : ''}`}
                        data-value="spouse"
                        onClick={() => handleRelationshipOptionClick('spouse', 'Spouse')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRelationshipOptionClick('spouse', 'Spouse');
                          }
                        }}
                        tabIndex={isRelationshipDropdownOpen ? 0 : -1}
                      >
                        Spouse
                      </div>
                      <div
                        className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRelationshipOption === 1 ? 'bg-blue-50' : ''}`}
                        data-value="parent"
                        onClick={() => handleRelationshipOptionClick('parent', 'Parent')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRelationshipOptionClick('parent', 'Parent');
                          }
                        }}
                        tabIndex={isRelationshipDropdownOpen ? 0 : -1}
                      >
                        Parent
                      </div>
                      <div
                        className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRelationshipOption === 2 ? 'bg-blue-50' : ''}`}
                        data-value="sibling"
                        onClick={() => handleRelationshipOptionClick('sibling', 'Sibling')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRelationshipOptionClick('sibling', 'Sibling');
                          }
                        }}
                        tabIndex={isRelationshipDropdownOpen ? 0 : -1}
                      >
                        Sibling
                      </div>
                      <div
                        className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRelationshipOption === 3 ? 'bg-blue-50' : ''}`}
                        data-value="friend"
                        onClick={() => handleRelationshipOptionClick('friend', 'Friend')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRelationshipOptionClick('friend', 'Friend');
                          }
                        }}
                        tabIndex={isRelationshipDropdownOpen ? 0 : -1}
                      >
                        Friend
                      </div>
                      <div
                        className={`option px-4 py-2 hover:bg-gray-100 cursor-pointer ${focusedRelationshipOption === 4 ? 'bg-blue-50' : ''}`}
                        data-value="other"
                        onClick={() => handleRelationshipOptionClick('other', 'Other')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRelationshipOptionClick('other', 'Other');
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
            </div>
          </div>
        </form>
      </div>
      <div className="w-full flex justify-end gap-2 mt-4 text-[12px] font-bold">
        <button 
          className="border border-gray-300 hover:bg-gray-200 rounded-md px-3 py-1"
          onClick={handleClose}>
          Cancel
        </button>
        <button
          className={`border border-gray-300 rounded-md px-3 py-[6px] text-white ${isFormValid ? 'bg-[#02367B] hover:bg-[#1C4A9E]' : 'bg-gray-400 cursor-not-allowed'}`}
          onClick={() => {
            if (!isSaving && onAddEmployee) {
              // Validate form before submission
              if (!validateForm()) {
                return;
              }
              
              setIsSaving(true);
              setIsClosing(true);
              setTimeout(() => {
                // Generate random password 8-10 characters
                const length = Math.floor(Math.random() * 3) + 8;
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
                let password = '';
                for (let i = 0; i < length; i++) {
                  password += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                onAddEmployee({
                  name: `${firstName} ${lastName}`,
                  firstName: firstName,
                  lastName: lastName,
                  role: selectedRoleText,
                  contact: `${email}\n${phone}\n${address}`,
                  status: selectedStatus,
                  avatar: undefined,
                  address,
                  salary,
                  contactName,
                  contactNumber,
                  relationship: selectedRelationshipText,
                  password
                });
                setIsClosing(false);
              }, 200);
            }
          }}
          disabled={isSaving}
        >
          {isSaving ? 'Adding...' : 'Add Employee'}
        </button>
      </div>
      </div>
    </div>
  );
}

export default AddStaffModal;

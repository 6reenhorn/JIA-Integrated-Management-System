import { useState, useEffect, useRef } from 'react';

interface AddStaffModalProps {
  onClose?: () => void;
}

const AddStaffModal = ({ onClose }: AddStaffModalProps) => {
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedStatusText, setSelectedStatusText] = useState('Select Status');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedRoleText, setSelectedRoleText] = useState('Select Role');
  const [isRelationshipDropdownOpen, setIsRelationshipDropdownOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState('');
  const [selectedRelationshipText, setSelectedRelationshipText] = useState('Select Relationship');
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const relationshipDropdownRef = useRef<HTMLDivElement>(null);

  const toggleStatusDropdown = () => {
    setIsStatusDropdownOpen(!isStatusDropdownOpen);
  };

  const toggleRoleDropdown = () => {
    setIsRoleDropdownOpen(!isRoleDropdownOpen);
  };

  const handleStatusOptionClick = (value: string, text: string) => {
    setSelectedStatus(value);
    setSelectedStatusText(text);
    setIsStatusDropdownOpen(false);
  };

  const handleRoleOptionClick = (value: string, text: string) => {
    setSelectedRole(value);
    setSelectedRoleText(text);
    setIsRoleDropdownOpen(false);
  };

  const toggleRelationshipDropdown = () => {
    setIsRelationshipDropdownOpen(!isRelationshipDropdownOpen);
  };

  const handleRelationshipOptionClick = (value: string, text: string) => {
    setSelectedRelationship(value);
    setSelectedRelationshipText(text);
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


  return (
    <div className="bg-gray-100 shadow-md rounded-lg p-6 w-[460px] max-h-[850px]">
      <div>
        <h3 className="text-[20px] font-bold">Add New Employee</h3>
        <p className="text-[12px]">Add a new team member to your organization with their details and role.</p>
      </div>
      <div className="overflow-y-auto max-h-[650px] mt-4 text-[12px]">
        <form action="submit" className='flex flex-col gap-3'>
          <div className="shadow-md shadow-gray-200 rounded-lg m-1 p-4">
            <h3 className="text-[16px] font-bold">Basic Information</h3>
            <div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col justify-center">
                  <label htmlFor="employee_first_name" className="text-[12px] font-bold">First Name</label>
                  <input type="text" id="employee_first_name" name="employee_first_name" className="border border-gray-300 rounded-md px-2 py-1" />
                </div>
                <div className="flex flex-col justify-center">
                  <label htmlFor="employee_last_name" className="text-[12px] font-bold">Last Name</label>
                  <input type="text" id="employee_last_name" name="employee_last_name" className="border border-gray-300 rounded-md px-2 py-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col justify-center">
                  <label htmlFor="employee_email_address" className="text-[12px] font-bold">Email Address</label>
                  <input type="text" id="employee_email_address" name="employee_email_address" className="border border-gray-300 rounded-md px-2 py-1" />
                </div>
                <div className="flex flex-col justify-center">
                  <label htmlFor="employee_phone_number" className="text-[12px] font-bold">Phone Number</label>
                  <input type="text" id="employee_phone_number" name="employee_phone_number" className="border border-gray-300 rounded-md px-2 py-1" />
                </div>
              </div>
              <div className='mt-2'>
                <label htmlFor="employee_address" className="text-[12px] font-bold">Address</label>
                <textarea name="employee_address" id="employee_address" className="w-full border border-gray-300 rounded-md px-2 py-1"></textarea>
              </div>
            </div>
          </div>
          <div className="shadow-md shadow-gray-200 rounded-lg m-1 p-4 text-[12px]">
            <h3 className="text-[16px] font-bold">Work Information</h3>
            <div className='flex gap-4 text-[12px] relative mt-2'>
              <div className="dropdown relative" ref={statusDropdownRef}>
                <p className="text-[12px] font-bold">Status</p>
                <div
                  className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-lg px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[29px]"
                  onClick={toggleStatusDropdown}
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
                  <div
                    className="option px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    data-value="active"
                    onClick={() => handleStatusOptionClick('active', 'Active')}
                  >
                    Active
                  </div>
                  <div
                    className="option px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    data-value="inactive"
                    onClick={() => handleStatusOptionClick('inactive', 'Inactive')}
                  >
                    Inactive
                  </div>
                </div>
              </div>
              <div className="dropdown relative" ref={roleDropdownRef}>
                <p className="text-[12px] font-bold">Role</p>
                <div
                  className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-lg px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[29px]"
                  onClick={toggleRoleDropdown}
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
                  <div
                    className="option px-4   py-2 hover:bg-gray-100 cursor-pointer"
                    data-value="manager"
                    onClick={() => handleRoleOptionClick('manager', 'Manager')}
                  >
                    Manager
                  </div>
                  <div
                    className="option px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    data-value="admin"
                    onClick={() => handleRoleOptionClick('admin', 'Admin')}
                  >
                    Admin
                  </div>
                  <div
                    className="option px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    data-value="sales_associates"
                    onClick={() => handleRoleOptionClick('sales_associates', 'Sales Associates')}
                  >
                    Sales Associates
                  </div>
                  <div
                    className="option px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    data-value="cashier"
                    onClick={() => handleRoleOptionClick('cashier', 'Cashier')}
                  >
                    Cashier
                  </div>
                  <div
                    className="option px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    data-value="maintenance"
                    onClick={() => handleRoleOptionClick('maintenance', 'Maintenance')}
                  >
                    Maintenance
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-2'>
              <label htmlFor="employee-salary" className='text-[12px] font-bold'>Salary</label>
              <input type="text" id='employee-salary' name='employee-salary' placeholder='Enter Salary (Optional)' className="border border-gray-300 rounded-md w-full px-2 py-1" />
            </div>
          </div>
          <div>
            <div className="shadow-md shadow-gray-200 rounded-lg m-1 p-4 text-[12px]">
              <h3 className="text-[16px] font-bold">Emergency Contact (Optional)</h3>
              <div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col justify-center">
                    <label htmlFor="employee_contact_name" className="text-[12px] font-bold">Contact Name</label>
                    <input type="text" id="employee_contact_name" name="employee_contact_name" placeholder="Enter Contact Name" className="border border-gray-300 rounded-md px-2 py-1" />
                  </div>
                  <div>
                    <label htmlFor="employee_contact_number" className="text-[12px] font-bold">Phone Number</label>
                    <input type="text" id="employee_contact_number" name="employee_contact_number" placeholder="Enter Phone Number" className="border border-gray-300 rounded-md px-2 py-1" />
                  </div>
                </div>
                <div className='mt-2 w-full'>
                  <div className="dropdown relative" ref={relationshipDropdownRef}>
                    <p className="text-[12px] font-bold">Relationship</p>
                    <div
                      className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-lg px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[29px]"
                      onClick={toggleRelationshipDropdown}
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
                      className="dropdown-options"
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
                    >
                      <div
                        className="option px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        data-value="spouse"
                        onClick={() => handleRelationshipOptionClick('spouse', 'Spouse')}
                      >
                        Spouse
                      </div>
                      <div
                        className="option px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        data-value="parent"
                        onClick={() => handleRelationshipOptionClick('parent', 'Parent')}
                      >
                        Parent
                      </div>
                      <div
                        className="option px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        data-value="sibling"
                        onClick={() => handleRelationshipOptionClick('sibling', 'Sibling')}
                      >
                        Sibling
                      </div>
                      <div
                        className="option px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        data-value="friend"
                        onClick={() => handleRelationshipOptionClick('friend', 'Friend')}
                      >
                        Friend
                      </div>
                      <div
                        className="option px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        data-value="other"
                        onClick={() => handleRelationshipOptionClick('other', 'Other')}
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
      <div className="w-full flex justify-end gap-2 mt-4">
        <button 
          className="border border-gray-300 rounded-md px-3 py-1"
          onClick={onClose}>
          Cancel
        </button>
        <button className="border border-gray-300 rounded-md px-3 py-1 bg-gray-500">
          Add Employee
        </button>
      </div>
    </div>
  );
}

export default AddStaffModal;

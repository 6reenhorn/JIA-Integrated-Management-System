import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import checkInIcon from '../../assets/JIA_CheckIn.ico';
import type { Employee } from '../../types/employee_types';

interface CheckInProps {
  onClose: () => void;
}

const CheckIn: React.FC<CheckInProps> = ({ onClose }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [password, setPassword] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [focusedEmployeeOption, setFocusedEmployeeOption] = useState(0);
    const employeeDropdownRef = useRef<HTMLDivElement>(null);

    const selectedEmployeeText = selectedEmployee ? `${selectedEmployee.name} (${selectedEmployee.empId})` : 'Select Employee';

    const toggleEmployeeDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleEmployeeOptionClick = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsDropdownOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/employees');
                setEmployees(response.data);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };
        fetchEmployees();
    }, []);

    return (
        <div className="relative w-[55vw] h-[60vh] px-8 py-16 bg-gradient-to-b from-[#02367B] to-[#016CA5] rounded-2xl rounded-tl-[14px] rounded-bl-[14px]">
            {/* Left Side */}
            <div className="w-[50%] h-full flex flex-col justify-between text-center ml-6">
                <div>
                    <p className="text-stone-50">
                        Welcome to JIMS: 
                        <span className="font-semibold text-white"> Jia Integrated Management System</span> 
                        —your all-in-one solution for smarter inventory management.
                    </p>
                </div>
                <div className='flex justify-center w-full'>
                    <img src={checkInIcon} alt="JIA Icon" className='w-[250px]' />
                </div>
                <div>
                    <p className="text-white font-semibold">
                        Efficient. Reliable. Integrated.
                    </p>
                </div>
            </div>

            {/* Right Side */}
            <div className="absolute top-0 right-0 bg-white w-[42%] h-full rounded-tl-[72px] rounded-bl-[72px] rounded-tr-[14px] rounded-br-[14px]">
                <div className="w-full h-full flex flex-col justify-around items-center px-12 py-26">
                    <div className='w-full'>
                        <div className="text-left">
                            <p className="text-[34px] font-bold tracking-wide bg-gradient-to-r from-[#02367B] to-[#016CA5] bg-clip-text text-transparent">
                                Hello,
                                <span className="block">Welcome Back!</span>
                            </p>
                        </div>
                    </div>
                    <div className="space-y-4 w-full">
                        {/* Custom Dropdown for Employees */}
                        <div className="relative">
                            <div
                                className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-3xl px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[40px]"
                                onClick={toggleEmployeeDropdown}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        toggleEmployeeDropdown();
                                        e.preventDefault();
                                    }
                                }}
                                tabIndex={0}
                            >
                                <div className='px-2'>
                                    {selectedEmployeeText}
                                </div>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                >
                                    <polygon points="4,6 12,6 8,12" fill="currentColor" />
                                </svg>
                            </div>
                            {isDropdownOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-lg max-h-40 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    {employees.map((employee) => (
                                        <div
                                            key={employee.id}
                                            onClick={() => {
                                                setSelectedEmployee(employee);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {employee.name} ({employee.empId})
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Password Input */}
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Password"
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-[40px]"
                        />
                    </div>
                    <div className='w-full'>
                        <button
                            className='w-full py-2 rounded-3xl bg-[#02367B] text-white'
                            onClick={async () => {
                                if (!selectedEmployee) {
                                    alert('Please select an employee.');
                                    return;
                                }
                                if (!password) {
                                    alert('Please enter your password.');
                                    return;
                                }
                                try {
                                    // Verify password
                                    if (password !== selectedEmployee.password) {
                                        alert('Incorrect password.');
                                        return;
                                    }
                                    // Check in
                                    const response = await axios.post('http://localhost:3001/api/attendance/checkin', {
                                        employeeId: selectedEmployee.id
                                    });
                                    alert('Check-in successful!');
                                    // Close the modal after successful check-in
                                    onClose();
                                    // Optionally reset form
                                    setSelectedEmployee(null);
                                    setPassword('');
                                } catch (error) {
                                    console.error('Error during check-in:', error);
                                }
                            }}
                        >
                            Check In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckIn;
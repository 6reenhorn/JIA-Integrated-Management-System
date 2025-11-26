import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import checkInIcon from '../../assets/JIA_CheckIn.ico';
import type { Employee } from '../../types/employee_types';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';

interface CheckInProps {
  onClose: () => void;
}

const CheckIn: React.FC<CheckInProps> = ({ onClose }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [password, setPassword] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [countdown, setCountdown] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const employeeDropdownRef = useRef<HTMLDivElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    const selectedEmployeeText = selectedEmployee ? `${selectedEmployee.name} (${selectedEmployee.empId})` : 'Select Employee';

    const { checkIn } = useAuth();

    const toggleEmployeeDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Handle countdown and auto-close
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && message?.type === 'success') {
            onClose();
        }
    }, [countdown, message, onClose]);

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
            setIsLoadingEmployees(true);
            try {
                const response = await axios.get('http://localhost:3001/api/employees');
                setEmployees(response.data);
            } catch (error) {
                console.error('Error fetching employees:', error);
            } finally {
                setIsLoadingEmployees(false);
            }
        };
        fetchEmployees();
    }, []);

    // Reset form when modal opens
    useEffect(() => {
        setSelectedEmployee(null);
        setPassword('');
        setIsDropdownOpen(false);
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
                        <div className="relative" ref={employeeDropdownRef}>
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
                                    {isLoadingEmployees ? (
                                        <div className="px-4 py-4 text-center text-gray-500">
                                            Loading employees...
                                        </div>
                                    ) : employees.length === 0 ? (
                                        <div className="px-4 py-4 text-center text-gray-500">
                                            No employees found
                                        </div>
                                    ) : (
                                        employees.map((employee) => (
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
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Password Input */}
                        <input
                            ref={passwordInputRef}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Password"
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-[40px]"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    // Trigger check-in on Enter key
                                    document.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
                                }
                            }}
                        />

                        {/* Message Display */}
                        <div className="relative h-0">
                            {message && (
                                <div className={`absolute top-2 left-0 right-0 text-center text-sm font-medium ${
                                    message.type === 'success' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {message.text}
                                    {message.type === 'success' && countdown > 0 && (
                                        <span className="ml-2">closing in {countdown}...</span>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                    <div className='w-full'>
                        <button
                            type="submit"
                            disabled={isProcessing || message?.type === 'success'}
                            className={`w-full py-2 rounded-3xl text-white transition-colors ${
                                isProcessing 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-[#02367B] hover:bg-[#1C4A9E]'
                            }`}
                            onClick={async () => {

                                if (isProcessing) return;
                                setMessage(null);
                                setCountdown(0);
                                
                                if (!selectedEmployee) {
                                    setMessage({ type: 'error', text: 'Please select an employee.' });
                                    return;
                                }
                                if (!password) {
                                    setMessage({ type: 'error', text: 'Please enter your password.' });
                                    return;
                                }
                                setIsProcessing(true);                               
                                try {
                                    // Check in with password verification on server
                                    await axios.post('http://localhost:3001/api/attendance/checkin', {
                                        employeeId: selectedEmployee.id,
                                        password: password
                                    });
                                    
                                    setMessage({ type: 'success', text: 'Check-in successful!' });
                                    setCountdown(3); //successful check-in countdown

                                    checkIn({
                                        id: selectedEmployee.id,
                                        empId: selectedEmployee.empId,
                                        name: selectedEmployee.name,
                                        role: selectedEmployee.role as UserRole,
                                    })
                                    
                                    // Reset form
                                    setSelectedEmployee(null);
                                    setPassword('');
                                    
                                } catch (error: any) {
                                    console.error('Error during check-in:', error);
                                    if (error.response?.data?.error) {
                                        setMessage({ type: 'error', text: error.response.data.error });
                                    } else {
                                        setMessage({ type: 'error', text: 'An error occurred during check-in.' });
                                    }
                                } finally {
                                    setIsProcessing(false);
                                }
                            }}
                        >
                            {isProcessing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                'Check In'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckIn;
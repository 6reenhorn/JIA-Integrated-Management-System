import React, { useState, useEffect, useRef } from 'react';
// import checkInIcon from '../../assets/JIA_CheckIn.ico';
import CheckIn_Icon from '../../assets/JIA_Official_Light.ico';
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
    const [showPassword, setShowPassword] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const employeeDropdownRef = useRef<HTMLDivElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const checkInButtonRef = useRef<HTMLButtonElement>(null);

    const selectedEmployeeText = selectedEmployee ? `${selectedEmployee.name} (${selectedEmployee.empId})` : 'Select Employee';

    const [activeIndex, setActiveIndex] = useState(-1);

    const { checkIn } = useAuth();

    const optionRefs = useRef<(HTMLDivElement | null)[]>([]);


    const toggleEmployeeDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Auto-close on success (after a short delay to show the message)
    useEffect(() => {
        if (message?.type === 'success') {
            const timer = setTimeout(() => {
                onClose();
            }, 1500); // 1.5 seconds to show success message
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

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
                const api = window.electronAPI;
                if (!api) return;
                const data = await api.getEmployees();
                setEmployees(data || []);
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
        setShowPassword(false);
        setIsDropdownOpen(false);
    }, []);

    const handleCheckIn = async () => {
        if (isProcessing) return;
        setMessage(null);
        
        if (!selectedEmployee) {
            setMessage({ type: 'error', text: 'Please select an employee.' });
            return;
        }
        if (!password) {
            setMessage({ type: 'error', text: 'Please enter your password.' });
            return;
        }
        
        setIsProcessing(true);
        const startTime = Date.now();
        
        try {
            const api = window.electronAPI;
            if (!api) throw new Error('IPC bridge unavailable');
            const response = await api.attendanceCheckIn({
                employeeId: selectedEmployee.id,
                password: password
            });

            // Calculate elapsed time
            const elapsedTime = Date.now() - startTime;
            // Ensure minimum 0.5 seconds delay
            const minDelay = 500;
            const remainingTime = Math.max(0, minDelay - elapsedTime);

            // Wait for remaining time if needed
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            // Handle successful check-in
            setMessage({ 
                type: 'success', 
                text: response.message || 'Check-in successful!' 
            });

            // Set user in auth context
            checkIn({
                id: response.user.id,
                empId: response.user.empId,
                name: response.user.name,
                role: response.user.role as UserRole,
                isAdmin: response.user.role.toLowerCase() === 'admin'
            });

            // Reset form
            setSelectedEmployee(null);
            setPassword('');

        } catch (error: any) {
            console.error('Error during check-in:', error);
            
            // Calculate elapsed time for error case too
            const elapsedTime = Date.now() - startTime;
            const minDelay = 500;
            const remainingTime = Math.max(0, minDelay - elapsedTime);

            // Wait for remaining time if needed
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            const errorMessage = error?.message || 'An error occurred during check-in.';
            setMessage({ type: 'error', text: errorMessage });
            
            // If it's an admin login error, try with emp_id
            if (errorMessage.includes('Employee not found') && selectedEmployee.empId === 'ADMIN001') {
                try {
                    const adminStartTime = Date.now();
                    const api = window.electronAPI;
                    if (!api) throw new Error('IPC bridge unavailable');
                    const adminResponse = await api.attendanceCheckIn({
                        employeeId: 'ADMIN001', // Try with emp_id instead of id
                        password: password
                    });
                    
                    // Ensure minimum delay for admin check-in too
                    const adminElapsedTime = Date.now() - adminStartTime;
                    const adminRemainingTime = Math.max(0, minDelay - adminElapsedTime);
                    if (adminRemainingTime > 0) {
                        await new Promise(resolve => setTimeout(resolve, adminRemainingTime));
                    }
                    
                    checkIn({
                        id: adminResponse.user.id,
                        empId: adminResponse.user.empId,
                        name: adminResponse.user.name,
                        role: adminResponse.user.role as UserRole,
                        isAdmin: true
                    });
                    
                    setMessage({ 
                        type: 'success', 
                        text: 'Admin access granted' 
                    });
                    setSelectedEmployee(null);
                    setPassword('');
                    return;
                } catch (adminError) {
                    console.error('Admin login error:', adminError);
                }
            }
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (activeIndex >= 0 && optionRefs.current[activeIndex]) {
            optionRefs.current[activeIndex].scrollIntoView({
            block: 'nearest',
            });
        }
    }, [activeIndex]);

    useEffect(() => {
        if (isDropdownOpen) {
            document.getElementById('employee-listbox')?.focus();
        }
    }, [isDropdownOpen]);

    return (
        <div className="relative w-[55vw] h-[60vh] px-8 py-16 bg-gradient-to-b from-[#02367B] to-[#016CA5] rounded-2xl rounded-tl-[14px] rounded-bl-[14px] modal-content">
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
                    <img src={CheckIn_Icon} alt="JIA Icon" />
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
                                className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-3xl px-4 text-gray-600 hover:bg-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 h-[40px]"
                                onClick={toggleEmployeeDropdown}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        setIsDropdownOpen(true);
                                        setActiveIndex(0);
                                        e.preventDefault();
                                    }
                                }}
                                tabIndex={0}
                                role="combobox"
                                aria-expanded={isDropdownOpen}
                                aria-controls="employee-listbox"
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
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 focus:outline-none rounded-2xl shadow-lg max-h-40 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                                    id="employee-listbox"
                                    role="listbox"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "ArrowDown") {
                                            setActiveIndex((prev) => Math.min(prev + 1, employees.length - 1));
                                            e.preventDefault();
                                        }
                                        
                                        if (e.key === "ArrowUp") {
                                            setActiveIndex((prev) => Math.max(prev - 1, 0));
                                            e.preventDefault();
                                        }

                                        if (e.key === 'Enter' && activeIndex >= 0) {
                                            setSelectedEmployee(employees[activeIndex]);
                                            setIsDropdownOpen(false);
                                        }

                                        if (e.key === 'Escape') {
                                            setIsDropdownOpen(false);
                                        }
                                    }}
                                >
                                    {isLoadingEmployees ? (
                                        <div className="px-4 py-4 text-center text-gray-500">
                                            Loading employees...
                                        </div>
                                    ) : employees.length === 0 ? (
                                        <div className="px-4 py-4 text-center text-gray-500">
                                            No employees found
                                        </div>
                                    ) : (
                                        employees.map((employee, index) => (
                                            <div
                                                key={employee.id}
                                                ref={(el) => {optionRefs.current[index] = el}}
                                                role="option"
                                                aria-selected={activeIndex === index}
                                                onClick={() => {
                                                    setSelectedEmployee(employee);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer 
                                                ${activeIndex === index ? "bg-blue-50" : "hover:bg-gray-100"}`}
                                                onMouseEnter={() => setActiveIndex(index)}
                                            >
                                                {employee.name} ({employee.empId})
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Password Input with Eye Icon */}
                        <div className="relative">
                            <input
                                ref={passwordInputRef}
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter Password"
                                className="w-full px-4 py-2 pr-12 bg-gray-100 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-[40px]"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isProcessing && message?.type !== 'success') {
                                        e.preventDefault();
                                        handleCheckIn();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    // Eye Slash Icon (hidden password)
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    // Eye Icon (visible password)
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Message Display */}
                        <div className="relative h-0">
                            {message && (
                                <div className={`absolute top-2 left-0 right-0 text-center text-sm font-medium ${
                                    message.type === 'success' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {message.text}
                                </div>
                            )}
                        </div>

                    </div>
                    <div className='w-full'>
                        <button
                            ref={checkInButtonRef}
                            type="button"
                            disabled={isProcessing || message?.type === 'success'}
                            className={`w-full py-2 rounded-3xl text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isProcessing 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-[#02367B] hover:bg-[#1C4A9E]'
                            }`}
                            onClick={handleCheckIn}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isProcessing && message?.type !== 'success') {
                                    e.preventDefault();
                                    handleCheckIn();
                                }
                            }}
                        >
                            {isProcessing ? (
                                <span className="flex items-center justify-center gap-2 focus:ring-2 focus:ring-blue-500">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Checking In
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
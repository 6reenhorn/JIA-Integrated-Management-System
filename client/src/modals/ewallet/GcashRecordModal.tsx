import React, { useState, useRef, useEffect } from 'react';

interface AddGCashRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddRecord: (record: GCashRecord) => void;
}

export interface GCashRecord {
    id: string;
    amount: number;
    serviceCharge: number;
    transactionType: 'Cash-In' | 'Cash-Out';
    chargeMOP: 'Cash' | 'GCash';
    referenceNumber: string;
    date: string;
}

const AddGCashRecordModal: React.FC<AddGCashRecordModalProps> = ({
    isOpen,
    onClose,
    onAddRecord,
}) => {
    const [formData, setFormData] = useState({
        amount: '',
        serviceCharge: '',
        transactionType: '',
        chargeMOP: '',
        referenceNumber: '',
        date: new Date().toISOString().split('T')[0],
    });

    const [dropdowns, setDropdowns] = useState({
        transactionType: false,
        chargeMOP: false,
    });

    const transactionTypeRef = useRef<HTMLDivElement>(null);
    const chargeMOPRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Transaction type options
    const transactionTypeOptions = ['Cash-In', 'Cash-Out'];
    const chargeMOPOptions = ['Cash', 'GCash'];

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (transactionTypeRef.current && !transactionTypeRef.current.contains(event.target as Node)) {
                setDropdowns(prev => ({ ...prev, transactionType: false }));
            }
            if (chargeMOPRef.current && !chargeMOPRef.current.contains(event.target as Node)) {
                setDropdowns(prev => ({ ...prev, chargeMOP: false }));
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleDropdownToggle = (dropdown: 'transactionType' | 'chargeMOP') => {
        setDropdowns(prev => ({
            ...prev,
            [dropdown]: !prev[dropdown],
        }));
    };

    const handleDropdownSelect = (dropdown: 'transactionType' | 'chargeMOP', value: string) => {
        setFormData(prev => ({
            ...prev,
            [dropdown]: value,
        }));
        setDropdowns(prev => ({
            ...prev,
            [dropdown]: false,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.amount || !formData.transactionType || !formData.chargeMOP || !formData.date) {
            alert('Please fill in all required fields');
            return;
        }

        const newRecord: GCashRecord = {
            id: Date.now().toString(),
            amount: parseFloat(formData.amount),
            serviceCharge: parseFloat(formData.serviceCharge) || 0,
            transactionType: formData.transactionType as 'Cash-In' | 'Cash-Out',
            chargeMOP: formData.chargeMOP as 'Cash' | 'GCash',
            referenceNumber: formData.referenceNumber,
            date: formData.date,
        };

        onAddRecord(newRecord);
        
        // Reset form
        setFormData({
            amount: '',
            serviceCharge: '',
            transactionType: '',
            chargeMOP: '',
            referenceNumber: '',
            date: new Date().toISOString().split('T')[0],
        });
        
        onClose();
    };

    const handleCancel = () => {
        // Reset form
        setFormData({
            amount: '',
            serviceCharge: '',
            transactionType: '',
            chargeMOP: '',
            referenceNumber: '',
            date: new Date().toISOString().split('T')[0],
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Background overlay - same as AddStaff modal */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />

            {/* Modal content - using AddStaff modal design */}
            <div className="bg-gray-100 shadow-md rounded-lg p-6 w-[460px] max-h-[850px] relative z-10">
                <div>
                    <h3 className="text-[20px] font-bold">Add New GCash Record</h3>
                    <p className="text-[12px]">Record GCash cash-in, GCash cash-out, service charge, and charge MOP.</p>
                </div>
                
                <div className="overflow-y-auto max-h-[650px] mt-4 text-[12px]">
                    <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
                        {/* Transaction Details Section */}
                        <div className="shadow-md shadow-gray-200 rounded-lg m-1 p-4">
                            <h3 className="text-[16px] font-bold">Transaction Details</h3>
                            <div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="flex flex-col justify-center">
                                        <label htmlFor="amount" className="text-[12px] font-bold">Amount (₱)</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            id="amount" 
                                            name="amount" 
                                            placeholder='₱0.00' 
                                            value={formData.amount} 
                                            onChange={(e) => handleInputChange('amount', e.target.value)} 
                                            className="border border-gray-300 rounded-md px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none" 
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <label htmlFor="serviceCharge" className="text-[12px] font-bold">Service Charge (₱)</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            id="serviceCharge" 
                                            name="serviceCharge" 
                                            placeholder='₱0.00' 
                                            value={formData.serviceCharge} 
                                            onChange={(e) => handleInputChange('serviceCharge', e.target.value)} 
                                            className="border border-gray-300 rounded-md px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transaction Type and MOP Section */}
                        <div className="shadow-md shadow-gray-200 rounded-lg m-1 p-4 text-[12px]">
                            <h3 className="text-[16px] font-bold">Transaction Information</h3>
                            <div className='flex gap-4 text-[12px] relative mt-2'>
                                {/* Transaction Type Dropdown */}
                                <div className="dropdown relative" ref={transactionTypeRef}>
                                    <p className="text-[12px] font-bold">Transaction Type</p>
                                    <div
                                        className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-lg px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[29px]"
                                        onClick={() => handleDropdownToggle('transactionType')}
                                    >
                                        {formData.transactionType || 'Select Transaction Type'}
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            className={`transition-transform ${dropdowns.transactionType ? 'rotate-180' : ''}`}
                                        >
                                            <polygon points="4,6 12,6 8,12" fill="currentColor" />
                                        </svg>
                                    </div>
                                    <div
                                        className="dropdown-options"
                                        style={{
                                            display: dropdowns.transactionType ? 'block' : 'none',
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
                                        {transactionTypeOptions.map((option) => (
                                            <div
                                                key={option}
                                                className="option px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => handleDropdownSelect('transactionType', option)}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Charge MOP Dropdown */}
                                <div className="dropdown relative" ref={chargeMOPRef}>
                                    <p className="text-[12px] font-bold">Charge MOP</p>
                                    <div
                                        className="dropdown-selected relative flex items-center justify-between bg-gray-100 border-2 w-full border-[#E5E7EB] rounded-lg px-4 text-gray-600 hover:bg-gray-200 cursor-pointer h-[29px]"
                                        onClick={() => handleDropdownToggle('chargeMOP')}
                                    >
                                        {formData.chargeMOP || 'Select MOP'}
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            className={`transition-transform ${dropdowns.chargeMOP ? 'rotate-180' : ''}`}
                                        >
                                            <polygon points="4,6 12,6 8,12" fill="currentColor" />
                                        </svg>
                                    </div>
                                    <div
                                        className="dropdown-options"
                                        style={{
                                            display: dropdowns.chargeMOP ? 'block' : 'none',
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
                                        {chargeMOPOptions.map((option) => (
                                            <div
                                                key={option}
                                                className="option px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => handleDropdownSelect('chargeMOP', option)}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information Section */}
                        <div className="shadow-md shadow-gray-200 rounded-lg m-1 p-4 text-[12px]">
                            <h3 className="text-[16px] font-bold">Additional Information</h3>
                            <div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="flex flex-col justify-center">
                                        <label htmlFor="referenceNumber" className="text-[12px] font-bold">Reference Number</label>
                                        <input 
                                            type="text" 
                                            id="referenceNumber" 
                                            name="referenceNumber" 
                                            placeholder="Enter reference number" 
                                            value={formData.referenceNumber} 
                                            onChange={(e) => handleInputChange('referenceNumber', e.target.value)} 
                                            className="border border-gray-300 rounded-md px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" 
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <label htmlFor="date" className="text-[12px] font-bold">Date</label>
                                        <input 
                                            type="date" 
                                            id="date" 
                                            name="date" 
                                            value={formData.date} 
                                            onChange={(e) => handleInputChange('date', e.target.value)} 
                                            className="border border-gray-300 rounded-md px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" 
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                
                {/* Action Buttons - same style as AddStaff modal */}
                <div className="w-full flex justify-end gap-2 mt-4 text-[12px] font-bold">
                    <button 
                        className="border border-gray-300 hover:bg-gray-200 rounded-md px-3 py-1"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button 
                        className="border border-gray-300 rounded-md px-3 py-1 bg-[#02367B] hover:bg-[#016CA5] text-white" 
                        onClick={handleSubmit}
                    >
                        Add Record
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddGCashRecordModal;
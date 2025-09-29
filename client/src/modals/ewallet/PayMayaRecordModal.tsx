import React, { useState, useRef, useEffect } from 'react';
import type { PayMayaRecord } from '../../types/ewallet_types';
import CustomDatePicker from '../../components/common/CustomDatePicker';

interface AddPayMayaRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddRecord: (record: PayMayaRecord) => void;
}

const AddPayMayaRecordModal: React.FC<AddPayMayaRecordModalProps> = ({
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
    const chargeMOPOptions = ['Cash', 'PayMaya'];

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
                handleCancel();
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
    }, [isOpen]);

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

        const newRecord: PayMayaRecord = {
            id: Date.now().toString(),
            amount: parseFloat(formData.amount),
            serviceCharge: parseFloat(formData.serviceCharge) || 0,
            transactionType: formData.transactionType as 'Cash-In' | 'Cash-Out',
            chargeMOP: formData.chargeMOP as 'Cash' | 'PayMaya',
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
            {/* Background overlay with blur effect */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                style={{
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)'
                }}
            />

            {/* Modal content */}
            <div 
                ref={modalRef}
                className="bg-white shadow-2xl rounded-lg p-6 w-[460px] max-h-[85vh] relative z-10 animate-in fade-in-0 zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div>
                    <h3 className="text-[20px] font-bold text-gray-900">Add New PayMaya Record</h3>
                    <p className="text-[12px] text-gray-600">Record PayMaya cash-in, PayMaya cash-out, service charge, and charge MOP.</p>
                </div>
                
                <div className="overflow-y-auto max-h-[60vh] mt-4 text-[12px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                        {/* Amount and Service Charge */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label htmlFor="amount" className="text-[12px] font-bold text-gray-700 mb-1">Amount (₱)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    id="amount" 
                                    name="amount" 
                                    placeholder='₱0.00' 
                                    value={formData.amount} 
                                    onChange={(e) => handleInputChange('amount', e.target.value)} 
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 bg-gray-100" 
                                    required
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="serviceCharge" className="text-[12px] font-bold text-gray-700 mb-1">Service Charge (₱)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    id="serviceCharge" 
                                    name="serviceCharge" 
                                    placeholder='₱0.00' 
                                    value={formData.serviceCharge} 
                                    onChange={(e) => handleInputChange('serviceCharge', e.target.value)} 
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 bg-gray-100" 
                                />
                            </div>
                        </div>

                        {/* Transaction Type and Charge MOP */}
                        <div className='grid grid-cols-2 gap-4'>
                            {/* Transaction Type Dropdown */}
                            <div className="dropdown relative" ref={transactionTypeRef}>
                                <label className="text-[12px] font-bold text-gray-700 mb-1 block">Transaction Type</label>
                                <div
                                    className="dropdown-selected relative flex items-center justify-between bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-700 hover:border-gray-400 cursor-pointer transition-all duration-200 min-h-[38px]"
                                    onClick={() => handleDropdownToggle('transactionType')}
                                >
                                    <span className={formData.transactionType ? 'text-gray-900' : 'text-gray-500'}>
                                        {formData.transactionType || 'Select Transaction Type'}
                                    </span>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        className={`transition-transform duration-200 ${dropdowns.transactionType ? 'rotate-180' : ''}`}
                                    >
                                        <polygon points="4,6 12,6 8,12" fill="currentColor" />
                                    </svg>
                                </div>
                                {dropdowns.transactionType && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 overflow-hidden">
                                        {transactionTypeOptions.map((option) => (
                                            <div
                                                key={option}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150 text-gray-700 hover:text-gray-900"
                                                onClick={() => handleDropdownSelect('transactionType', option)}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Charge MOP Dropdown */}
                            <div className="dropdown relative" ref={chargeMOPRef}>
                                <label className="text-[12px] font-bold text-gray-700 mb-1 block">Charge MOP (₱)</label>
                                <div
                                    className="dropdown-selected relative flex items-center justify-between bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-700 hover:border-gray-400 cursor-pointer transition-all duration-200 min-h-[38px]"
                                    onClick={() => handleDropdownToggle('chargeMOP')}
                                >
                                    <span className={formData.chargeMOP ? 'text-gray-900' : 'text-gray-500'}>
                                        {formData.chargeMOP || 'Select MOP'}
                                    </span>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        className={`transition-transform duration-200 ${dropdowns.chargeMOP ? 'rotate-180' : ''}`}
                                    >
                                        <polygon points="4,6 12,6 8,12" fill="currentColor" />
                                    </svg>
                                </div>
                                {dropdowns.chargeMOP && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 overflow-hidden">
                                        {chargeMOPOptions.map((option) => (
                                            <div
                                                key={option}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150 text-gray-700 hover:text-gray-900"
                                                onClick={() => handleDropdownSelect('chargeMOP', option)}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reference Number */}
                        <div className="flex flex-col">
                            <label htmlFor="referenceNumber" className="text-[12px] font-bold text-gray-700 mb-1">Reference Number</label>
                            <input 
                                type="text" 
                                id="referenceNumber" 
                                name="referenceNumber" 
                                placeholder="Enter reference number" 
                                value={formData.referenceNumber} 
                                onChange={(e) => handleInputChange('referenceNumber', e.target.value)} 
                                className="border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 bg-gray-100" 
                            />
                        </div>

                        {/* Date */}
                        <div className="flex flex-col">
                            <label htmlFor="date" className="text-[12px] font-bold text-gray-700 mb-1">Date</label>
                            <CustomDatePicker
                                selected={formData.date ? new Date(formData.date) : null}
                                onChange={(date: Date | null) => handleInputChange('date', date ? date.toISOString().split('T')[0] : '')}
                            />
                        </div>
                    </form>
                </div>
                
                {/* Action Buttons */}
                <div className="w-full flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button 
                        type="button"
                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 font-medium text-sm"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="px-4 py-2 bg-[#02367B] hover:bg-[#01285a] text-white rounded-md transition-colors duration-200 font-medium text-sm shadow-sm" 
                        onClick={handleSubmit}
                    >
                        Add Record
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddPayMayaRecordModal;
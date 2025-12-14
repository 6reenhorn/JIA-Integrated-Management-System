import React, { useState, useRef, useEffect } from 'react';
import type { GCashRecord } from '../../../types/ewallet_types';
import CustomDatePicker from '../../../components/common/CustomDatePicker';

interface EditGCashRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEditRecord: (id: string, record: Omit<GCashRecord, 'id'>) => void;
    record: GCashRecord | null;
    isEditing?: boolean;
}

const EditGCashRecordModal: React.FC<EditGCashRecordModalProps> = ({
    isOpen,
    onClose,
    onEditRecord,
    record,
    isEditing = false
}) => {
    const [isClosing, setIsClosing] = useState(false);

    const getLocalISODate = (date: Date) => {
        const tzOffset = date.getTimezoneOffset() * 60000;
        const local = new Date(date.getTime() - tzOffset);
        return local.toISOString().split('T')[0];
    };
    
    const parseLocalDate = (dateString: string) => {
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const y = Number(parts[0]);
            const m = Number(parts[1]) - 1;
            const d = Number(parts[2]);
            return new Date(y, m, d);
        }
        return new Date(dateString);
    };

    // Format number with commas
    const formatNumberWithCommas = (value: string): string => {
        const numericValue = value.replace(/,/g, '');
        if (!numericValue || isNaN(Number(numericValue))) return '';
        return Number(numericValue).toLocaleString('en-US');
    };

    // Parse formatted number to actual number
    const parseFormattedNumber = (value: string): number => {
        const numericValue = value.replace(/,/g, '');
        return parseFloat(numericValue) || 0;
    };

    const [formData, setFormData] = useState({
        amount: '',
        serviceCharge: '',
        transactionType: '',
        chargeMOP: '',
        referenceNumber: '',
        date: getLocalISODate(new Date()),
    });

    const [dropdowns, setDropdowns] = useState({
        transactionType: false,
        chargeMOP: false,
    });

    const [isFormValid, setIsFormValid] = useState(false);

    const transactionTypeRef = useRef<HTMLDivElement>(null);
    const chargeMOPRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const amountRef = useRef<HTMLInputElement>(null);
    const serviceChargeRef = useRef<HTMLInputElement>(null);
    const transactionSelectedRef = useRef<HTMLDivElement>(null);
    const chargeMOPSelectedRef = useRef<HTMLDivElement>(null);
    const referenceNumberRef = useRef<HTMLInputElement>(null);
    const dateWrapperRef = useRef<HTMLDivElement>(null);
    const transactionOptionsListRef = useRef<HTMLDivElement>(null);
    const chargeMOPOptionsListRef = useRef<HTMLDivElement>(null);

    const [focusedTransactionOption, setFocusedTransactionOption] = useState(0);
    const [focusedChargeMOPOption, setFocusedChargeMOPOption] = useState(0);

    const transactionTypeOptions = ['Cash-In', 'Cash-Out'];
    const chargeMOPOptions = ['Cash', 'GCash'];

    // Initialize form with record data
    useEffect(() => {
        if (record && isOpen) {
            setFormData({
                amount: formatNumberWithCommas(record.amount.toString()),
                serviceCharge: formatNumberWithCommas(record.serviceCharge.toString()),
                transactionType: record.transactionType,
                chargeMOP: record.chargeMOP,
                referenceNumber: record.referenceNumber || '',
                date: record.date,
            });
        }
    }, [record, isOpen]);

    // Validate form
    useEffect(() => {
        const valid = formData.amount.trim() !== '' && 
                    formData.transactionType !== '' && 
                    formData.chargeMOP !== '' && 
                    formData.date !== '';
        setIsFormValid(valid);
    }, [formData.amount, formData.transactionType, formData.chargeMOP, formData.date]);

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
            if (event.key === 'Escape' && !isEditing) {
                handleCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isEditing]);

    const handleInputChange = (field: string, value: string) => {
        if (field === 'amount' || field === 'serviceCharge') {
            const numericValue = value.replace(/[^0-9.]/g, '');
            const formatted = formatNumberWithCommas(numericValue);
            setFormData(prev => ({
                ...prev,
                [field]: formatted,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const handleDropdownToggle = (dropdown: 'transactionType' | 'chargeMOP') => {
        if (!isEditing) {
            setDropdowns(prev => {
                const opening = !prev[dropdown];
                if (opening) {
                    if (dropdown === 'transactionType') setFocusedTransactionOption(0);
                    else setFocusedChargeMOPOption(0);
                }
                return ({ ...prev, [dropdown]: !prev[dropdown] });
            });

            // focus the first option after opening
            setTimeout(() => {
                if (dropdown === 'transactionType' && transactionOptionsListRef.current) {
                    const el = transactionOptionsListRef.current.querySelector('[data-option]') as HTMLElement | null;
                    el?.focus();
                }
                if (dropdown === 'chargeMOP' && chargeMOPOptionsListRef.current) {
                    const el = chargeMOPOptionsListRef.current.querySelector('[data-option]') as HTMLElement | null;
                    el?.focus();
                }
            }, 0);
        }
    };

    const handleDropdownKeyDown = (dropdown: 'transactionType' | 'chargeMOP', e: React.KeyboardEvent) => {
        if (isEditing) return;
        const options = dropdown === 'transactionType' ? transactionTypeOptions : chargeMOPOptions;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setDropdowns(prev => ({ ...prev, [dropdown]: !prev[dropdown] }));
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!dropdowns[dropdown]) {
                setDropdowns(prev => ({ ...prev, [dropdown]: true }));
                return;
            }
            if (dropdown === 'transactionType') {
                const next = (focusedTransactionOption + 1) % options.length;
                setFocusedTransactionOption(next);
                const nodes = transactionOptionsListRef.current?.querySelectorAll('[data-option]');
                const el = nodes ? (nodes[next] as HTMLElement) : null;
                el?.focus();
            } else {
                const next = (focusedChargeMOPOption + 1) % options.length;
                setFocusedChargeMOPOption(next);
                const nodes = chargeMOPOptionsListRef.current?.querySelectorAll('[data-option]');
                const el = nodes ? (nodes[next] as HTMLElement) : null;
                el?.focus();
            }
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!dropdowns[dropdown]) return;
            if (dropdown === 'transactionType') {
                const len = options.length;
                const prev = (focusedTransactionOption - 1 + len) % len;
                setFocusedTransactionOption(prev);
                const nodes = transactionOptionsListRef.current?.querySelectorAll('[data-option]');
                const el = nodes ? (nodes[prev] as HTMLElement) : null;
                el?.focus();
            } else {
                const len = options.length;
                const prev = (focusedChargeMOPOption - 1 + len) % len;
                setFocusedChargeMOPOption(prev);
                const nodes = chargeMOPOptionsListRef.current?.querySelectorAll('[data-option]');
                const el = nodes ? (nodes[prev] as HTMLElement) : null;
                el?.focus();
            }
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            setDropdowns(prev => ({ ...prev, [dropdown]: false }));
            return;
        }

        if (e.key === 'Tab') {
            if (dropdowns[dropdown]) {
                e.preventDefault();
                if (dropdown === 'transactionType') {
                    const el = transactionOptionsListRef.current?.querySelector('[data-option]') as HTMLElement | null;
                    el?.focus();
                } else {
                    const el = chargeMOPOptionsListRef.current?.querySelector('[data-option]') as HTMLElement | null;
                    el?.focus();
                }
                return;
            }
            setDropdowns(prev => ({ ...prev, [dropdown]: false }));
        }
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
        // after selection, move focus to next logical control
        setTimeout(() => {
            if (dropdown === 'transactionType') {
                chargeMOPSelectedRef.current?.focus();
            } else if (dropdown === 'chargeMOP') {
                referenceNumberRef.current?.focus();
            }
        }, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid || !record || isEditing) {
            return;
        }

        const updatedRecord: Omit<GCashRecord, 'id'> = {
            amount: parseFormattedNumber(formData.amount),
            serviceCharge: parseFormattedNumber(formData.serviceCharge),
            transactionType: formData.transactionType as 'Cash-In' | 'Cash-Out',
            chargeMOP: formData.chargeMOP as 'Cash' | 'GCash',
            referenceNumber: formData.referenceNumber,
            date: formData.date,
        };

        setIsClosing(true);
        setTimeout(() => {
            onEditRecord(record.id, updatedRecord);
            onClose();
        }, 200);
    };

    const handleCancel = () => {
        if (!isEditing) {
            setIsClosing(true);
            setTimeout(onClose, 300);
        }
    };

    if (!isOpen || !record) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
                // onClick={!isEditing ? handleCancel : undefined}
                style={{
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)'
                }}
            />

            <div 
                ref={modalRef}
                className={`bg-white shadow-2xl rounded-lg p-6 w-[460px] max-h-[85vh] relative z-10 ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div>
                    <h3 className="text-[20px] font-bold text-gray-900">Edit GCash Record</h3>
                    <p className="text-[12px] text-gray-600">Record GCash cash-in, GCash cash-out, service charge, and charge MOP.</p>
                </div>
                
                <div className='shadow-md shadow-gray-200 rounded-md mt-4'>
                    <div className="overflow-y-auto max-h-[60vh] mt-4 p-4 text-[12px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                            {/* Amount and Service Charge */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label htmlFor="amount" className="text-[12px] font-bold text-gray-700 mb-1">Amount (₱)</label>
                                    <input
                                        type="text"
                                        id="amount"
                                        name="amount"
                                        placeholder='0.00'
                                        value={formData.amount}
                                        onChange={(e) => handleInputChange('amount', e.target.value)}
                                        ref={amountRef}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                serviceChargeRef.current?.focus();
                                            }
                                        }}
                                        className="border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 bg-gray-100"
                                        required
                                        disabled={isEditing}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="serviceCharge" className="text-[12px] font-bold text-gray-700 mb-1">Service Charge (₱)</label>
                                    <input
                                        type="text"
                                        id="serviceCharge"
                                        name="serviceCharge"
                                        placeholder='0.00'
                                        value={formData.serviceCharge}
                                        onChange={(e) => handleInputChange('serviceCharge', e.target.value)}
                                        ref={serviceChargeRef}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                transactionSelectedRef.current?.focus();
                                            }
                                        }}
                                        className="border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 bg-gray-100"
                                        disabled={isEditing}
                                    />
                                </div>
                            </div>
                            {/* Transaction Type and Charge MOP */}
                            <div className='grid grid-cols-2 gap-4'>
                                <div className="dropdown relative" ref={transactionTypeRef}>
                                    <label className="text-[12px] font-bold text-gray-700 mb-1 block">Transaction Type</label>
                                    <div
                                        className={`dropdown-selected relative flex items-center justify-between bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-700 transition-all duration-200 h-[29px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${!isEditing ? 'hover:border-gray-400 cursor-pointer' : 'cursor-not-allowed'}`}
                                        onClick={() => handleDropdownToggle('transactionType')}
                                        tabIndex={isEditing ? -1 : 0}
                                        ref={transactionSelectedRef}
                                        onKeyDown={(e) => handleDropdownKeyDown('transactionType', e)}
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
                                    {dropdowns.transactionType && !isEditing && (
                                        <div
                                            ref={transactionOptionsListRef}
                                            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 overflow-hidden"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const selected = transactionTypeOptions[focusedTransactionOption];
                                                    handleDropdownSelect('transactionType', selected);
                                                }
                                                if (e.key === 'ArrowDown') {
                                                    e.preventDefault();
                                                    const len = transactionTypeOptions.length;
                                                    const next = (focusedTransactionOption + 1) % len;
                                                    setFocusedTransactionOption(next);
                                                    const nodes = transactionOptionsListRef.current?.querySelectorAll('[data-option]');
                                                    const el = nodes ? (nodes[next] as HTMLElement) : null;
                                                    el?.focus();
                                                }
                                                if (e.key === 'ArrowUp') {
                                                    e.preventDefault();
                                                    const len = transactionTypeOptions.length;
                                                    const prev = (focusedTransactionOption - 1 + len) % len;
                                                    setFocusedTransactionOption(prev);
                                                    const nodes = transactionOptionsListRef.current?.querySelectorAll('[data-option]');
                                                    const el = nodes ? (nodes[prev] as HTMLElement) : null;
                                                    el?.focus();
                                                }
                                            }}
                                        >
                                            {transactionTypeOptions.map((option, idx) => (
                                                <div
                                                    key={option}
                                                    data-option
                                                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150 text-gray-700 hover:text-gray-900 focus:outline-none ${focusedTransactionOption === idx ? 'bg-blue-50' : ''}`}
                                                    onClick={() => handleDropdownSelect('transactionType', option)}
                                                    tabIndex={dropdowns.transactionType ? 0 : -1}
                                                >
                                                    {option}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="dropdown relative" ref={chargeMOPRef}>
                                    <label className="text-[12px] font-bold text-gray-700 mb-1 block">Charge MOP (₱)</label>
                                    <div
                                        className={`dropdown-selected relative flex items-center justify-between bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-700 transition-all duration-200 h-[29px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${!isEditing ? 'hover:border-gray-400 cursor-pointer' : 'cursor-not-allowed'}`}
                                        onClick={() => handleDropdownToggle('chargeMOP')}
                                        tabIndex={isEditing ? -1 : 0}
                                        ref={chargeMOPSelectedRef}
                                        onKeyDown={(e) => handleDropdownKeyDown('chargeMOP', e)}
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
                                    {dropdowns.chargeMOP && !isEditing && (
                                        <div
                                            ref={chargeMOPOptionsListRef}
                                            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 overflow-hidden"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const selected = chargeMOPOptions[focusedChargeMOPOption];
                                                    handleDropdownSelect('chargeMOP', selected);
                                                }
                                                if (e.key === 'ArrowDown') {
                                                    e.preventDefault();
                                                    const len = chargeMOPOptions.length;
                                                    const next = (focusedChargeMOPOption + 1) % len;
                                                    setFocusedChargeMOPOption(next);
                                                    const nodes = chargeMOPOptionsListRef.current?.querySelectorAll('[data-option]');
                                                    const el = nodes ? (nodes[next] as HTMLElement) : null;
                                                    el?.focus();
                                                }
                                                if (e.key === 'ArrowUp') {
                                                    e.preventDefault();
                                                    const len = chargeMOPOptions.length;
                                                    const prev = (focusedChargeMOPOption - 1 + len) % len;
                                                    setFocusedChargeMOPOption(prev);
                                                    const nodes = chargeMOPOptionsListRef.current?.querySelectorAll('[data-option]');
                                                    const el = nodes ? (nodes[prev] as HTMLElement) : null;
                                                    el?.focus();
                                                }
                                            }}
                                        >
                                            {chargeMOPOptions.map((option, idx) => (
                                                <div
                                                    key={option}
                                                    data-option
                                                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150 text-gray-700 hover:text-gray-900 focus:outline-none ${focusedChargeMOPOption === idx ? 'bg-blue-50' : ''}`}
                                                    onClick={() => handleDropdownSelect('chargeMOP', option)}
                                                    tabIndex={dropdowns.chargeMOP ? 0 : -1}
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
                                    ref={referenceNumberRef}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            dateWrapperRef.current?.focus();
                                        }
                                    }}
                                    className="border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 bg-gray-100"
                                    disabled={isEditing}
                                />
                            </div>
                            {/* Date */}
                            <div className="flex flex-col">
                                <label htmlFor="date" className="text-[12px] font-bold text-gray-700 mb-1">Date</label>
                                <div ref={dateWrapperRef} tabIndex={isEditing ? -1 : 0} className="outline-none">
                                    <CustomDatePicker
                                        selected={formData.date ? parseLocalDate(formData.date) : null}
                                        onChange={(date: Date | null) => handleInputChange('date', date ? getLocalISODate(date) : '')}
                                        maxDate={new Date()}
                                        disabled={isEditing}
                                        className='py-[5px]'
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="w-full flex justify-end gap-3 mt-3 pt-4 border-gray-200">
                    <button 
                        type="button"
                        className="px-3 py-[5px] border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 font-medium text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        onClick={handleCancel}
                        disabled={isEditing}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className={`px-3 py-[5px] rounded-md transition-colors duration-200 font-medium text-sm shadow-sm ${
                            isFormValid && !isEditing
                                ? 'bg-[#02367B] hover:bg-[#01285a] text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500' 
                                : 'bg-gray-400 text-white cursor-not-allowed'
                        }`}
                        onClick={handleSubmit}
                        disabled={!isFormValid || isEditing}
                    >
                        {isEditing ? (
                            <>
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Updating...
                            </>
                        ) : (
                            'Update Record'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditGCashRecordModal;
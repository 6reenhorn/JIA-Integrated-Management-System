import React, { useState, useRef, useEffect } from 'react';
import type { JuanPayRecord, JuanPayBeginning } from '../../../types/ewallet_types';
import CustomDatePicker from '../../../components/common/CustomDatePicker';
import { Plus, X } from 'lucide-react';

interface AddJuanPayRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddRecord: (record: Omit<JuanPayRecord, 'id'>) => void;
    lastEndingBalance?: number | null;
}

const AddJuanPayRecordModal: React.FC<AddJuanPayRecordModalProps> = ({
    isOpen,
    onClose,
    onAddRecord,
    lastEndingBalance = null,
}) => {
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
        date: getLocalISODate(new Date()),
        beginnings: [{ amount: '' }] as Array<{ amount: string }>,
        ending: '',
        sales: '',
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Pre-fill beginning balance with last ending balance
    useEffect(() => {
        if (isOpen && lastEndingBalance !== null && lastEndingBalance !== undefined) {
            setFormData(prev => ({
                ...prev,
                beginnings: [{ amount: formatNumberWithCommas(lastEndingBalance.toString()) }]
            }));
        }
    }, [lastEndingBalance, isOpen]);

    // Validate form
    useEffect(() => {
        const hasValidBeginning = formData.beginnings.some(b => b.amount.trim() !== '');
        const valid = hasValidBeginning && formData.date !== '';
        setIsFormValid(valid);
    }, [formData.beginnings, formData.date]);

    // Calculate sales automatically
    useEffect(() => {
        const totalBeginning = formData.beginnings.reduce((sum, b) => {
            const amount = parseFormattedNumber(b.amount) || 0;
            return sum + amount;
        }, 0);
        const ending = parseFormattedNumber(formData.ending) || 0;
        const calculatedSales = totalBeginning - ending;
        
        setFormData(prev => ({
            ...prev,
            sales: calculatedSales > 0 ? calculatedSales.toFixed(2) : '0.00'
        }));
    }, [formData.beginnings, formData.ending]);

    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
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
    }, [isOpen]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleBeginningChange = (index: number, value: string) => {
        const numericValue = value.replace(/[^0-9.]/g, '');
        const formatted = formatNumberWithCommas(numericValue);
        const newBeginnings = [...formData.beginnings];
        newBeginnings[index] = { amount: formatted };
        setFormData(prev => ({
            ...prev,
            beginnings: newBeginnings
        }));
    };

    const handleEndingChange = (value: string) => {
        const numericValue = value.replace(/[^0-9.]/g, '');
        const formatted = formatNumberWithCommas(numericValue);
        setFormData(prev => ({
            ...prev,
            ending: formatted
        }));
    };

    const addBeginningField = () => {
        setFormData(prev => ({
            ...prev,
            beginnings: [...prev.beginnings, { amount: '' }]
        }));
    };

    const removeBeginningField = (index: number) => {
        if (formData.beginnings.length > 1) {
            const newBeginnings = formData.beginnings.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                beginnings: newBeginnings
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isFormValid) {
            return;
        }

        const beginnings: JuanPayBeginning[] = formData.beginnings
            .filter(b => b.amount.trim() !== '')
            .map(b => ({ amount: parseFormattedNumber(b.amount) }));

        const newRecord: Omit<JuanPayRecord, 'id'> = {
            date: formData.date,
            beginnings: beginnings,
            ending: parseFormattedNumber(formData.ending) || 0,
            sales: parseFloat(formData.sales) || 0,
        };

        onAddRecord(newRecord);
        
        // Reset form
        setFormData({
            date: getLocalISODate(new Date()),
            beginnings: [{ amount: '' }],
            ending: '',
            sales: '',
        });
        
        onClose();
    };

    const handleCancel = () => {
        setFormData({
            date: getLocalISODate(new Date()),
            beginnings: [{ amount: '' }],
            ending: '',
            sales: '',
        });
        onClose();
    };

    if (!isOpen) return null;

    const totalBeginning = formData.beginnings.reduce((sum, b) => {
        const amount = parseFormattedNumber(b.amount) || 0;
        return sum + amount;
    }, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Background overlay */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
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
                    <h3 className="text-[20px] font-bold text-gray-900">Add New JuanPay Record</h3>
                    <p className="text-[12px] text-gray-600">Record JuanPay beginning balance(s), ending balance, and sales.</p>
                </div>
                
                <div className="overflow-y-auto max-h-[60vh] mt-4 text-[12px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                        {/* Date */}
                        <div className="flex flex-col">
                            <label htmlFor="date" className="text-[12px] font-bold text-gray-700 mb-1">Date</label>
                            <CustomDatePicker
                                selected={formData.date ? parseLocalDate(formData.date) : null}
                                onChange={(date: Date | null) => handleInputChange('date', date ? getLocalISODate(date) : '')}
                                maxDate={new Date()}
                            />
                        </div>

                        {/* Beginning Balance(s) */}
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[12px] font-bold text-gray-700">Beginning Balance (₱)</label>
                                <button
                                    type="button"
                                    onClick={addBeginningField}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-[11px] font-medium"
                                >
                                    <Plus className="w-3 h-3" />
                                    Add More
                                </button>
                            </div>
                            
                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {formData.beginnings.map((beginning, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input 
                                            type="text"
                                            placeholder={`Beginning #${index + 1}`}
                                            value={beginning.amount} 
                                            onChange={(e) => handleBeginningChange(index, e.target.value)} 
                                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 bg-gray-100" 
                                        />
                                        {formData.beginnings.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeBeginningField(index)}
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                                title="Remove"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {formData.beginnings.length > 1 && (
                                <div className="mt-2 text-[11px] text-gray-600 bg-blue-50 px-3 py-2 rounded-md">
                                    Total Beginning: ₱{totalBeginning.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            )}
                        </div>

                        {/* Ending Balance */}
                        <div className="flex flex-col">
                            <label htmlFor="ending" className="text-[12px] font-bold text-gray-700 mb-1">Ending Balance (₱)</label>
                            <input 
                                type="text"
                                id="ending" 
                                name="ending" 
                                placeholder='0.00' 
                                value={formData.ending} 
                                onChange={(e) => handleEndingChange(e.target.value)} 
                                className="border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 bg-gray-100" 
                            />
                        </div>

                        {/* Sales (Auto-calculated) */}
                        <div className="flex flex-col">
                            <label htmlFor="sales" className="text-[12px] font-bold text-gray-700 mb-1">Sales (Auto-calculated)</label>
                            <input 
                                type="text" 
                                id="sales" 
                                name="sales" 
                                value={`₱${parseFloat(formData.sales).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                readOnly
                                className="border border-gray-300 rounded-md px-3 py-2 bg-gray-200 text-gray-700 cursor-not-allowed" 
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Sales = Total Beginning - Ending</p>
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
                        className={`px-4 py-2 rounded-md transition-colors duration-200 font-medium text-sm shadow-sm ${
                            isFormValid 
                                ? 'bg-[#02367B] hover:bg-[#01285a] text-white' 
                                : 'bg-gray-400 text-white cursor-not-allowed'
                        }`}
                        onClick={handleSubmit}
                        disabled={!isFormValid}
                    >
                        Add Record
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddJuanPayRecordModal;
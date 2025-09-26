import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div 
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New GCash Record</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600 mb-6">
            Record GCash cash-in, GCash cash-out, service charge, and charge MOP.
          </p>

          {/* Amount and Service Charge Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₱)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="₱0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Charge (₱)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="₱0.00"
                value={formData.serviceCharge}
                onChange={(e) => handleInputChange('serviceCharge', e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Transaction Type and Charge MOP Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Transaction Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <div className="relative" ref={transactionTypeRef}>
                <button
                  type="button"
                  onClick={() => handleDropdownToggle('transactionType')}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                >
                  <span className={formData.transactionType ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.transactionType || 'Select Transaction Type'}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${dropdowns.transactionType ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {dropdowns.transactionType && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {transactionTypeOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleDropdownSelect('transactionType', option)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Charge MOP Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Charge MOP (₱)
              </label>
              <div className="relative" ref={chargeMOPRef}>
                <button
                  type="button"
                  onClick={() => handleDropdownToggle('chargeMOP')}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                >
                  <span className={formData.chargeMOP ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.chargeMOP || 'Select MOP'}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${dropdowns.chargeMOP ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {dropdowns.chargeMOP && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {chargeMOPOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleDropdownSelect('chargeMOP', option)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Number
            </label>
            <input
              type="text"
              placeholder="Enter reference number"
              value={formData.referenceNumber}
              onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Add Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGCashRecordModal;
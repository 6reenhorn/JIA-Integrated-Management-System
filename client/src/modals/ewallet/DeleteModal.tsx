import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { GCashRecord } from '../../components/e-wallet/Gcash/GcashRecordsTable';

//Delete modal

interface DeleteGCashRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmDelete: (id: string) => void;
    record: GCashRecord | null;
}

const DeleteGCashRecordModal: React.FC<DeleteGCashRecordModalProps> = ({
    isOpen,
    onClose,
    onConfirmDelete,
    record,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

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

    const handleConfirm = () => {
        if (record) {
            onConfirmDelete(record.id);
        }
        onClose();
    };

    const formatCurrency = (amount: number): string => {
        return `₱${amount.toFixed(2)}`;
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });
    };

    if (!isOpen || !record) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Background overlay with blur effect */}
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
                className="bg-white shadow-2xl rounded-lg p-6 w-[420px] max-h-[85vh] relative z-10 animate-in fade-in-0 zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertTriangle size={24} className="text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-[18px] font-bold text-gray-900">Delete GCash Record</h3>
                            <p className="text-[12px] text-gray-600">This action cannot be undone</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Warning Message */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-800 mb-2 font-medium">
                        You are about to permanently delete this GCash record:
                    </p>
                    
                    {/* Record Summary */}
                    <div className="bg-white rounded-lg p-3 mt-3 border border-red-100">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <span className="text-gray-600 font-medium">Record ID:</span>
                                <div className="font-mono text-gray-900">#{record.id}</div>
                            </div>
                            <div>
                                <span className="text-gray-600 font-medium">Date:</span>
                                <div className="text-gray-900">{formatDate(record.date)}</div>
                            </div>
                            <div>
                                <span className="text-gray-600 font-medium">Type:</span>
                                <div className="text-gray-900">{record.transactionType}</div>
                            </div>
                            <div>
                                <span className="text-gray-600 font-medium">Amount:</span>
                                <div className="text-gray-900 font-semibold">{formatCurrency(record.amount)}</div>
                            </div>
                            {record.referenceNumber && (
                                <div className="col-span-2">
                                    <span className="text-gray-600 font-medium">Reference:</span>
                                    <div className="font-mono text-gray-900 text-xs">{record.referenceNumber}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Confirmation Message */}
                <div className="mb-6">
                    <p className="text-sm text-gray-700">
                        Are you sure you want to delete this record? This will permanently remove the transaction 
                        from your records and cannot be recovered.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                    <button 
                        type="button"
                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 font-medium text-sm"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 font-medium text-sm shadow-sm"
                        onClick={handleConfirm}
                    >
                        Delete Record
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteGCashRecordModal;
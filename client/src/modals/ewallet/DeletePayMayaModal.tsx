import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { PayMayaRecord } from '../../types/ewallet_types';

interface DeletePayMayaRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmDelete: (id: string) => void;
    record: PayMayaRecord | null;
    isDeleting?: boolean;
}

const DeletePayMayaRecordModal: React.FC<DeletePayMayaRecordModalProps> = ({
    isOpen,
    onClose,
    onConfirmDelete,
    record,
    isDeleting = false
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isDeleting) {
                onClose();
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
    }, [isOpen, onClose, isDeleting]);

    const handleConfirm = () => {
        if (record && !isDeleting) {
            onConfirmDelete(record.id);
        }
    };

    const formatCurrency = (amount: number): string => {
        return `₱${amount.toFixed(2)}`;
    };

    const formatDate = (dateString: string): string => {
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const year = Number(parts[0]);
            const month = Number(parts[1]) - 1;
            const day = Number(parts[2]);
            const localDate = new Date(year, month, day);
            return localDate.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
            });
        }
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
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={!isDeleting ? onClose : undefined}
                style={{
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)'
                }}
            />

            <div 
                ref={modalRef}
                className="bg-white shadow-2xl rounded-lg p-6 w-[420px] max-h-[85vh] relative z-10 animate-in fade-in-0 zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertTriangle size={24} className="text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-[18px] font-bold text-gray-900">Delete PayMaya Record</h3>
                            <p className="text-[12px] text-gray-600">This action cannot be undone</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-800 mb-2 font-medium">
                        You are about to permanently delete this PayMaya record:
                    </p>
                    
                    <div className="bg-white rounded-lg p-3 mt-3 border border-red-100">
                        <div className="grid grid-cols-2 gap-3 text-xs">
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
                            <div>
                                <span className="text-gray-600 font-medium">Service Charge:</span>
                                <div className="text-gray-900">{formatCurrency(record.serviceCharge)}</div>
                            </div>
                            {record.referenceNumber && (
                                <div className="col-span-2">
                                    <span className="text-gray-600 font-medium">Reference:</span>
                                    <div className="font-mono text-gray-900 text-xs truncate">{record.referenceNumber}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-gray-700">
                        Are you sure you want to delete this record? This will remove the transaction 
                        from your records permanently.
                    </p>
                </div>

                <div className="flex justify-end space-x-3">
                    <button 
                        type="button"
                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Deleting...
                            </>
                        ) : (
                            'Delete Record'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeletePayMayaRecordModal;
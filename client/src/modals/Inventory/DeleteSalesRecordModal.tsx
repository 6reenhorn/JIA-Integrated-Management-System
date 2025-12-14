import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { SalesRecord } from '../../components/inventory/Elements of Sales/SalesTable';
import Portal from '../../components/common/Portal';

interface DeleteSalesRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmDelete: (id: number) => void;
    record: SalesRecord | null;
    isDeleting?: boolean;
}

const DeleteSalesRecordModal: React.FC<DeleteSalesRecordModalProps> = ({
    isOpen,
    onClose,
    onConfirmDelete,
    record,
    isDeleting = false
}) => {
    const [isClosing, setIsClosing] = useState(false);
    const [wasDeleting, setWasDeleting] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const handleCancel = useCallback(() => {
        if (isDeleting) return;
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    }, [isDeleting, onClose]);

    // Watch for deletion completion
    useEffect(() => {
        if (wasDeleting && !isDeleting && isOpen) {
            // Deletion just completed successfully, start closing animation
            setIsClosing(true);
            setTimeout(() => {
                onClose();
                setIsClosing(false);
                setWasDeleting(false);
            }, 300);
        }
    }, [isDeleting, wasDeleting, isOpen, onClose]);

    // Track when deletion starts
    useEffect(() => {
        if (isDeleting) {
            setWasDeleting(true);
        }
    }, [isDeleting]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isDeleting) {
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
    }, [isOpen, isDeleting, handleCancel]);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                if (!isDeleting) {
                    handleCancel();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDeleting, handleCancel]);

    const handleConfirm = () => {
        if (record && !isDeleting) {
            onConfirmDelete(record.id);
        }
    };

    const formatCurrency = (amount: number): string => {
        return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

    if (!isOpen && !isClosing) return null;

    return (
        <Portal>
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop with full coverage blur */}
            <div 
                className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${
                    isClosing ? 'opacity-0' : 'opacity-100'
                }`}
                onClick={!isDeleting ? handleCancel : undefined}
                style={{
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                }}
            />

            <div 
                ref={modalRef}
                className={`bg-white shadow-2xl rounded-lg p-6 w-[420px] max-h-[85vh] relative z-10 ${
                    isClosing ? 'animate-modal-out' : 'animate-modal-in'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertTriangle size={24} className="text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-[18px] font-bold text-gray-900">Delete Sales Record</h3>
                            <p className="text-[12px] text-gray-600">This action cannot be undone</p>
                        </div>
                    </div>
                    <button
                        onClick={handleCancel}
                        disabled={isDeleting}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-800 mb-2 font-medium">
                        You are about to permanently delete this sales record:
                    </p>
                    
                    <div className="bg-white rounded-lg p-3 mt-3 border border-red-100">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="col-span-2">
                                <span className="text-gray-600 font-medium">Product Name:</span>
                                <div className="text-gray-900 font-semibold truncate">{record?.productName}</div>
                            </div>
                            <div>
                                <span className="text-gray-600 font-medium">Date:</span>
                                <div className="text-gray-900">{record ? formatDate(record.date) : ''}</div>
                            </div>
                            <div>
                                <span className="text-gray-600 font-medium">Quantity:</span>
                                <div className="text-gray-900">{record?.quantity}</div>
                            </div>
                            <div>
                                <span className="text-gray-600 font-medium">Price:</span>
                                <div className="text-gray-900">{record ? formatCurrency(record.price) : ''}</div>
                            </div>
                            <div>
                                <span className="text-gray-600 font-medium">Total:</span>
                                <div className="text-green-600 font-semibold">{record ? formatCurrency(record.total) : ''}</div>
                            </div>
                            <div>
                                <span className="text-gray-600 font-medium">Payment Method:</span>
                                <div className="text-gray-900">{record?.paymentMethod}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-gray-700">
                        Are you sure you want to delete this sales record? This will remove the transaction 
                        from your sales history permanently.
                    </p>
                </div>

                <div className="flex justify-end space-x-3">
                    <button 
                        type="button"
                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onClick={handleCancel}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
    </Portal>
    );
};

export default DeleteSalesRecordModal;
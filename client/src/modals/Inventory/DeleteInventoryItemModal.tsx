import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { InventoryItem } from '../../types/inventory_types';

interface DeleteInventoryItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmDelete: (id: number) => void;
    item: InventoryItem | null;
    isDeleting?: boolean;
}

const DeleteInventoryItemModal: React.FC<DeleteInventoryItemModalProps> = ({
    isOpen,
    onClose,
    onConfirmDelete,
    item,
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
        if (item && !isDeleting) {
            onConfirmDelete(item.id);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'In Stock':
                return 'bg-green-100 text-green-800';
            case 'Low Stock':
                return 'bg-yellow-100 text-yellow-800';
            case 'Out Of Stock':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!isOpen || !item) return null;

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
                            <h3 className="text-[18px] font-bold text-gray-900">Delete Inventory Item</h3>
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
                        You are about to permanently delete this inventory item:
                    </p>
                    
                    <div className="bg-white rounded-lg p-3 mt-3 border border-red-100">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="col-span-2">
                                <span className="text-gray-600 font-medium">Product Name:</span>
                                <div className="text-gray-900 font-semibold truncate">{item.productName}</div>
                            </div>
                            <div>
                                <span className="text-gray-600 font-medium">Category:</span>
                                <div className="text-gray-900">{item.category}</div>
                            </div>
                            <div>
                                <span className="text-gray-600 font-medium">Stock:</span>
                                <div className="text-gray-900">{item.stock} Units</div>
                            </div>
                            <div>
                                <span className="text-gray-600 font-medium">Status:</span>
                                <div className="text-gray-900">
                                    <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-600 font-medium">Price:</span>
                                <div className="text-gray-900">₱{item.productPrice.toFixed(2)}</div>
                            </div>
                            <div>
                                <span className="text-gray-600 font-medium">Total Value:</span>
                                <div className="text-gray-900 font-semibold">₱{item.totalAmount.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-gray-700">
                        Are you sure you want to delete this inventory item? This will remove the product 
                        from your inventory permanently and may affect your sales records.
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
                            'Delete Item'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteInventoryItemModal;
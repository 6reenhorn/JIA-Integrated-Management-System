import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Category {
  name: string;
  productCount: number;
  totalStock: number;
  totalValue: number;
  color?: string;
}

interface DeleteCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmDelete: (categoryName: string) => void;
    category: Category | null;
    isDeleting?: boolean;
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
    isOpen,
    onClose,
    onConfirmDelete,
    category,
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
        if (category && !isDeleting) {
            onConfirmDelete(category.name);
        }
    };

    if (!isOpen || !category) return null;

    const hasProducts = category.productCount > 0;

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
                            <h3 className="text-[18px] font-bold text-gray-900">Delete Category</h3>
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
                        You are about to permanently delete this category:
                    </p>
                    
                    <div className="bg-white rounded-lg p-3 mt-3 border border-red-100">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="col-span-2">
                                <span className="text-gray-600 font-medium">Category Name:</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div 
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: category.color || '#6B7280' }}
                                    />
                                    <span className="text-gray-900 font-semibold truncate">{category.name}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-600 font-medium">Products:</span>
                                <div className="text-gray-900 font-semibold">{category.productCount}</div>
                            </div>
                            <div>
                                <span className="text-gray-600 font-medium">Total Stock:</span>
                                <div className="text-gray-900">{category.totalStock} Units</div>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-600 font-medium">Category Value:</span>
                                <div className="text-gray-900 font-semibold">
                                    ₱{category.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {hasProducts && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex gap-2">
                            <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-800">
                                <span className="font-semibold">Warning:</span> This category contains {category.productCount} product{category.productCount !== 1 ? 's' : ''}. 
                                Deleting this category will affect all associated products.
                            </p>
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <p className="text-sm text-gray-700">
                        Are you sure you want to delete this category? This will remove the category 
                        from your system permanently{hasProducts ? ' and may affect associated products' : ''}.
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
                            'Delete Category'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteCategoryModal;
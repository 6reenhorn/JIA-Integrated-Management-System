import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeletePayrollRecordModalProps {
  isOpen: boolean;
  recordId: number | null;
  employeeName?: string;
  periodLabel?: string; // e.g., "March 2025"
  isDeleting?: boolean;
  onClose: () => void;
  onConfirmDelete: (id: number) => Promise<void> | void;
}

const DeletePayrollRecordModal: React.FC<DeletePayrollRecordModalProps> = ({
  isOpen,
  recordId,
  employeeName,
  periodLabel,
  isDeleting = false,
  onClose,
  onConfirmDelete
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleEscape = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape' && !isDeleting) {
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
    if (recordId !== null && !isDeleting) {
      onConfirmDelete(recordId);
    }
  };

  if (!isOpen || recordId === null) return null;

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
              <h3 className="text-[18px] font-bold text-gray-900">Delete Payroll Record</h3>
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
            You are about to permanently delete this payroll record:
          </p>
          <div className="bg-white rounded-lg p-3 mt-3 border border-red-100">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600 font-medium">Employee:</span>
                <div className="text-gray-900">{employeeName ?? 'Unknown'}</div>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Record ID:</span>
                <div className="text-gray-900">{recordId}</div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600 font-medium">Period:</span>
                <div className="text-gray-900">{periodLabel ?? '-'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete this payroll record? This will remove it permanently from your records.
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
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

export default DeletePayrollRecordModal;



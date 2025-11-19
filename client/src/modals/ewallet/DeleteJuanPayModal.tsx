import React, { useEffect, useRef } from 'react';
import type { JuanPayRecord } from '../../types/ewallet_types';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteJuanPayRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
  record: JuanPayRecord | null;
  isDeleting: boolean;
}

const DeleteJuanPayRecordModal: React.FC<DeleteJuanPayRecordModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  record,
  isDeleting
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
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !record) return null;

  const formatCurrency = (amount: number): string => {
    return `₱${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
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

  const totalBeginning = record.beginnings.reduce((sum, b) => sum + b.amount, 0);

  const handleConfirm = () => {
    if (record && !isDeleting) {
      onConfirmDelete(record.id);
    }
  };

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
              <h3 className="text-[18px] font-bold text-gray-900">Delete JuanPay Record</h3>
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
            You are about to permanently delete this JuanPay record:
          </p>
          
          <div className="bg-white rounded-lg p-3 mt-3 border border-red-100">
            <div className="space-y-3 text-xs">
              {/* Date */}
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Date:</span>
                <span className="text-gray-900 font-medium">{formatDate(record.date)}</span>
              </div>
              
              {/* Beginning Balance */}
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Beginning Balance:</span>
                  <span className="text-gray-900 font-semibold">{formatCurrency(totalBeginning)}</span>
                </div>
                {record.beginnings.length > 1 && (
                  <div className="mt-2 pl-3 space-y-1 bg-gray-50 rounded py-2 px-2 border border-gray-100">
                    <div className="text-[10px] text-gray-500 font-medium mb-1">Breakdown:</div>
                    {record.beginnings.map((b, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] text-gray-600">
                        <span>Entry #{idx + 1}</span>
                        <span className="font-medium">{formatCurrency(b.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Ending Balance */}
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Ending Balance:</span>
                <span className="text-gray-900 font-medium">{formatCurrency(record.ending)}</span>
              </div>
              
              {/* Sales */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Sales:</span>
                <span className="text-gray-900 font-medium">{formatCurrency(record.sales)}</span>
              </div>
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

export default DeleteJuanPayRecordModal;
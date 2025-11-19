import React, { useEffect } from 'react';
import type { JuanPayRecord } from '../../types/ewallet_types';
import { AlertTriangle } from 'lucide-react';

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
    return dateString;
  };

  const totalBeginning = record.beginnings.reduce((sum, b) => sum + b.amount, 0);

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
        className="bg-white shadow-2xl rounded-lg p-6 w-[460px] relative z-10 animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete JuanPay Record</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium text-gray-900">{formatDate(record.date)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Beginning Balance:</span>
            <span className="font-medium text-gray-900">{formatCurrency(totalBeginning)}</span>
          </div>
          {record.beginnings.length > 1 && (
            <div className="pl-4 space-y-1">
              {record.beginnings.map((b, idx) => (
                <div key={idx} className="flex justify-between text-xs text-gray-500">
                  <span>Entry #{idx + 1}:</span>
                  <span>{formatCurrency(b.amount)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ending Balance:</span>
            <span className="font-medium text-gray-900">{formatCurrency(record.ending)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sales:</span>
            <span className="font-medium text-gray-900">{formatCurrency(record.sales)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
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
            onClick={() => onConfirmDelete(record.id)}
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
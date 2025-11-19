import React from 'react';
import type { JuanPayRecord } from '../../../types/ewallet_types';
import { Edit, Trash2 } from 'lucide-react';

interface JuanPayRecordsTableProps {
    records: JuanPayRecord[];
    isLoading: boolean;
    onEdit?: (record: JuanPayRecord) => void;
    onDelete?: (record: JuanPayRecord) => void;
    isAdding?: boolean;
    isDeleting?: boolean;
}

const JuanPayRecordsTable: React.FC<JuanPayRecordsTableProps> = ({
    records,
    isLoading,
    onEdit,
    onDelete,
    isAdding = false,
    isDeleting = false,
}) => {

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

    if (isLoading) {
        return (
            <div className="border-2 border-[#E5E7EB] rounded-lg min-h-[390px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <p className="mt-4 text-gray-500">Loading JuanPay records...</p>
                </div>
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div className="border-2 border-[#E5E7EB] rounded-lg">
                <div className="overflow-x-auto">
                    <table className="table-fixed bg-[#EDEDED] w-full">
                        <thead className="border-[#E5E7EB] border-b">
                            <tr>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[110px]">
                                    Date
                                </th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[145px]">
                                    Beginning Balance
                                </th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[140px]">
                                    Ending Balance
                                </th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">
                                    Sales
                                </th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[67.8px]">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                    </table>
                </div>
                
                <div className="h-[335px] flex items-center justify-center">
                    <p className="text-gray-500">
                        No JuanPay records found. Add your first record to get started.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="border-2 border-[#E5E7EB] rounded-lg">
            <div className="h-[390px] overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <table className="table-fixed w-full">
                    <thead className={`border-[#E5E7EB] border-b sticky top-0 z-10 ${isAdding ? 'bg-gradient-to-r from-green-300 via-green-500 to-green-300 bg-[length:200%_100%] animate-[gradient_2s_ease-in-out_infinite]' : isDeleting ? 'bg-gradient-to-r from-red-300 via-red-500 to-red-300 bg-[length:200%_100%] animate-[gradient_2s_ease-in-out_infinite]' : 'bg-[#EDEDED]'}`}>
                        <tr>
                            <th className="rounded-tl-lg text-left py-4 px-6 text-sm font-medium text-gray-500 w-[110px]">
                                Date
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[145px]">
                                Beginning Balance
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[140px]">
                                Ending Balance
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">
                                Sales
                            </th>
                            <th className="rounded-tr-lg text-left py-4 px-6 text-sm font-medium text-gray-500 w-[67.8px]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {records.map((record) => {
                            const totalBeginning = record.beginnings.reduce((sum, b) => sum + b.amount, 0);
                            const hasMultipleBeginnings = record.beginnings.length > 1;
                            
                            return (
                                <tr key={record.id} className="hover:bg-gray-50">
                                    <td className="py-4 px-6 w-[120px]">
                                        <div className="text-sm text-gray-900">
                                            {formatDate(record.date)}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 w-[200px]">
                                        {hasMultipleBeginnings ? (
                                            <div className="space-y-1">
                                                {record.beginnings.map((beginning, idx) => (
                                                    <div key={idx} className="text-sm text-gray-700">
                                                        {formatCurrency(beginning.amount)}
                                                    </div>
                                                ))}
                                                <div className="text-sm font-semibold text-gray-900 pt-1 border-t border-gray-200 w-3/5">
                                                    Total: {formatCurrency(totalBeginning)}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatCurrency(totalBeginning)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900 w-[140px]">
                                        {formatCurrency(record.ending)}
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-red-500 w-[120px]">
                                        {formatCurrency(record.sales)}
                                    </td>
                                    <td className="py-4 px-5 w-[100px]">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onEdit && onEdit(record)}
                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => onDelete && onDelete(record)}
                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JuanPayRecordsTable;
import React from 'react';
import type { PayMayaRecord } from '../../../types/ewallet_types';
import { Edit, Trash2 } from 'lucide-react';
import { useDateFormat } from '../../../context/DateFormatContext';

interface PayMayaRecordsTableProps {
    records: PayMayaRecord[];
    isLoading?: boolean;
    onEdit?: (record: PayMayaRecord) => void;
    onDelete?: (record: PayMayaRecord) => void;
    isAdding?: boolean;
    isDeleting?: boolean;
}

const PayMayaRecordsTable: React.FC<PayMayaRecordsTableProps> = ({
    records,
    isLoading = false,
    onEdit,
    onDelete,
    isAdding = false,
    isDeleting = false,
}) => {

    const { formatDate: formatDateWithPreference } = useDateFormat();

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
            return formatDateWithPreference(localDate);
        }
        const date = new Date(dateString);
        return formatDateWithPreference(date);
    }

    const getTransactionTypeColor = (type: string): string => {
        return type === 'Cash-In'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    const getMOPColor = (mop: string): string => {
        return mop === 'Cash'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-purple-100 text-purple-800';
    };

    if (isLoading) {
        return (
            <div className="border-2 border-[#E5E7EB] rounded-lg min-h-[390px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <p className="mt-4 text-gray-500">Loading PayMaya records...</p>
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
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">
                                    Date
                                </th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[150px]">
                                    Reference Number
                                </th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[140px]">
                                    Transaction Type
                                </th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">
                                    Amount
                                </th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[130px]">
                                    Service Charge
                                </th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">
                                    Charge MOP
                                </th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                    </table>
                </div>
                
                <div className="h-[335px] flex items-center justify-center">
                    <p className="text-gray-500">
                        No PayMaya records found. Add your first record to get started.
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
                            <th className="rounded-tl-lg text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">
                                Date
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[150px]">
                                Reference Number
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[140px]">
                                Transaction Type
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[120px]">
                                Amount
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[130px]">
                                Service Charge
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">
                                Charge MOP
                            </th>
                            <th className="rounded-tr-lg text-left py-4 px-6 text-sm font-medium text-gray-500 w-[100px]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {records.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                                <td className="py-4 px-6 w-[120px]">
                                    <div className="text-sm text-gray-900">
                                        {formatDate(record.date)}
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-900 w-[150px]">
                                    <div className="truncate">
                                        {record.referenceNumber || 'N/A'}
                                    </div>
                                </td>
                                <td className="py-4 px-6 w-[140px]">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(
                                            record.transactionType
                                        )}`}
                                    >
                                        {record.transactionType}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-sm font-medium text-gray-900 w-[120px]">
                                    {formatCurrency(record.amount)}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-900 w-[130px]">
                                    {formatCurrency(record.serviceCharge)}
                                </td>
                                <td className="py-4 px-6 w-[100px]">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMOPColor(
                                            record.chargeMOP
                                        )}`}
                                    >
                                        {record.chargeMOP}
                                    </span>
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayMayaRecordsTable;
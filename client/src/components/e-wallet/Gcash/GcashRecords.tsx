import React from 'react';
import type { GCashRecord } from '../../../types/ewallet_types';
import { Edit, Trash2 } from 'lucide-react';
import { useDateFormat } from '../../../context/DateFormatContext';

interface GCashRecordsTableProps {
    records: GCashRecord[];
    isLoading: boolean;
    onEdit?: (record: GCashRecord) => void;
    onDelete?: (record: GCashRecord) => void;
    isAdding?: boolean;
    isDeleting?: boolean;
}

const GCashRecordsTable: React.FC<GCashRecordsTableProps> = ({
    records,
    isLoading,
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

    const formatDate = (dateString: string | number | null | undefined): string => {
        if (dateString === null || dateString === undefined || dateString === '') return '-';
        
        // Handle timestamp numbers
        if (typeof dateString === 'number') {
            const minTimestamp = new Date('1970-01-01').getTime();
            const maxTimestamp = new Date('2100-01-01').getTime();
            if (dateString >= minTimestamp && dateString <= maxTimestamp) {
                const date = new Date(dateString);
                if (!isNaN(date.getTime())) {
                    const formatted = formatDateWithPreference(date);
                    if (formatted && formatted !== '-' && !formatted.includes('NaN')) {
                        return formatted;
                    }
                }
            }
            return '-';
        }
        
        // Handle string values
        const strValue = String(dateString).trim();
        if (!strValue || strValue === 'null' || strValue === 'undefined' || strValue === 'NaN' || strValue === '') {
            return '-';
        }
        
        // Handle string that might be a timestamp
        if (!isNaN(Number(strValue)) && strValue.length > 10 && !strValue.includes('-') && !strValue.includes('/')) {
            const timestamp = parseFloat(strValue);
            const minTimestamp = new Date('1970-01-01').getTime();
            const maxTimestamp = new Date('2100-01-01').getTime();
            if (timestamp >= minTimestamp && timestamp <= maxTimestamp) {
                const date = new Date(timestamp);
                if (!isNaN(date.getTime())) {
                    const formatted = formatDateWithPreference(date);
                    if (formatted && formatted !== '-' && !formatted.includes('NaN')) {
                        return formatted;
                    }
                }
            }
        }
        
        // Handle date strings (YYYY-MM-DD format)
        try {
            const dateMatch = strValue.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|\s|$)/);
            if (dateMatch) {
                const year = parseInt(dateMatch[1], 10);
                const month = parseInt(dateMatch[2], 10) - 1;
                const day = parseInt(dateMatch[3], 10);

                if (!isNaN(year) && !isNaN(month) && !isNaN(day) && 
                    year >= 1970 && year <= 2100 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
                    const localDate = new Date(year, month, day);
                    if (!isNaN(localDate.getTime())) {
                        const formatted = formatDateWithPreference(localDate);
                        if (formatted && formatted !== '-' && !formatted.includes('NaN') && formatted.length > 0) {
                            return formatted;
                        }
                    }
                }
            }
            
            const date = new Date(strValue);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                if (year >= 1970 && year <= 2100) {
                    const formatted = formatDateWithPreference(date);
                    if (formatted && formatted !== '-' && !formatted.includes('NaN') && formatted.length > 0) {
                        return formatted;
                    }
                }
            }
        } catch (error) {
            console.error('Error formatting date:', error, dateString);
        }
        return '-';
    };

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
            <div className="border-2 border-[#E5E7EB] rounded-lg">
                <div className="h-[421px] overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <table className="table-fixed w-full">
                        <thead className="border-[#E5E7EB] border-b sticky top-0 z-10 bg-[#EDEDED]">
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
                            {[...Array(7)].map((_, index) => (
                                <tr key={index} className="animate-pulse">
                                    <td className="py-4 px-6 w-[120px]">
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    </td>
                                    <td className="py-4 px-6 w-[150px]">
                                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                                    </td>
                                    <td className="py-4 px-6 w-[140px]">
                                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                                    </td>
                                    <td className="py-4 px-6 w-[120px]">
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    </td>
                                    <td className="py-4 px-6 w-[130px]">
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    </td>
                                    <td className="py-4 px-6 w-[100px]">
                                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                    </td>
                                    <td className="py-4 px-5 w-[100px]">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 bg-gray-200 rounded"></div>
                                            <div className="h-6 w-6 bg-gray-200 rounded"></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div className="border-2 border-[#E5E7EB] rounded-lg">
                <div className="h-[86px] overflow-x-auto">
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
                    </table>
                </div>
                
                <div className="h-[335px] flex items-center justify-center">
                    <p className="text-gray-500">
                        No GCash records found.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="border-2 border-[#E5E7EB] rounded-lg">
            <div className="h-[421px] overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                                            className="p-1 hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => onDelete && onDelete(record)}
                                            className="p-1 hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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

export default GCashRecordsTable;
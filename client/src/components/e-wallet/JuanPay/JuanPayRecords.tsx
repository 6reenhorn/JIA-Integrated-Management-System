import React from 'react';
import type { JuanPayRecord } from '../../../types/ewallet_types';
import { Edit, Trash2 } from 'lucide-react';
import { useDateFormat } from '../../../context/DateFormatContext';

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
        
        // Handle string that might be a timestamp (long numeric string without dashes)
        if (!isNaN(Number(strValue)) && strValue.length > 10 && !strValue.includes('-') && !strValue.includes('/')) {
            // Likely a timestamp string
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

    if (isLoading) {
        return (
            <div className="border-2 border-[#E5E7EB] rounded-lg">
                <div className="h-[421px] overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <table className="table-fixed w-full">
                        <thead className="border-[#E5E7EB] border-b sticky top-0 z-10 bg-[#EDEDED]">
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
                            {[...Array(7)].map((_, index) => (
                                <tr key={index} className="animate-pulse">
                                    <td className="py-4 px-6 w-[120px]">
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    </td>
                                    <td className="py-4 px-6 w-[200px]">
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    </td>
                                    <td className="py-4 px-6 w-[140px]">
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    </td>
                                    <td className="py-4 px-6 w-[120px]">
                                        <div className="h-4 bg-red-200 rounded w-24"></div>
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
                    </table>
                </div>
                
                <div className="h-[335px] flex items-center justify-center">
                    <p className="text-gray-500">
                        No JuanPay records found.
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
                        // Handle beginnings as array of objects with amount property
                        let beginningsArray: number[] = [];
                        if (Array.isArray(record.beginnings)) {
                            beginningsArray = record.beginnings.map(b => {
                                if (typeof b === 'object' && b !== null && 'amount' in b) {
                                    return typeof b.amount === 'number' ? b.amount : parseFloat(b.amount) || 0;
                                }
                                return typeof b === 'number' ? b : parseFloat(b) || 0;
                            });
                        } else if (record.beginnings) {
                            // Fallback for old string format (pipe-separated)
                            if (typeof record.beginnings === 'string') {
                                beginningsArray = record.beginnings.split('|')
                                    .map(val => parseFloat(val.trim()))
                                    .filter(val => !isNaN(val));
                            }
                        }
                        
                        const totalBeginning = beginningsArray.reduce((sum, amount) => sum + amount, 0);
                        const hasMultipleBeginnings = beginningsArray.length > 1;
                        
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
                                {beginningsArray.map((amount, idx) => (
                                    <div key={idx} className="text-sm text-gray-700">
                                    {formatCurrency(amount)}
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
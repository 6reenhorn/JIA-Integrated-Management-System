import React from 'react';
export interface GCashRecord {
    id: string;
    amount: number;
    serviceCharge: number;
    transactionType: 'Cash-In' | 'Cash-Out';
    chargeMOP: 'Cash' | 'GCash';
    referenceNumber: string;
    date: string;
}

interface GCashRecordsTableProps {
    records: GCashRecord[];
}

const GCashRecordsTable: React.FC<GCashRecordsTableProps> = ({
    records,
}) => {
    const formatCurrency = (amount: number): string => {
        return `₱${amount.toFixed(2)}`;
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });
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

    if (records.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">
                    No GCash records found. Add your first record to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto border-2 border-[#E5E7EB] rounded-lg">
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
                    </tr>
                </thead>
            </table>
            <div className="max-h-[370px] overflow-y-auto min-h-[370px]">
                <table className="table-fixed w-full">
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GCashRecordsTable;

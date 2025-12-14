import React from 'react';
import LayoutCard from '../../layout/LayoutCard';
import { useDateFormat } from '../../../context/DateFormatContext';
import type { SummaryCardProps } from '../../../types/ewallet_types';

interface SummaryCardsProps {
  selectedDateStats: {
    gcash: {
      cashIn: number;
      cashInCharges: number;
      cashOut: number;
      cashOutCharges: number;
      totalCharges: number;
    };
    paymaya: {
      cashIn: number;
      cashInCharges: number;
      cashOut: number;
      cashOutCharges: number;
      totalCharges: number;
    };
    juanpay: {
      beginning: number;
      ending: number;
      sales: number;
      avgSales: number;
    };
  } | null;
  summaryStartDate: Date | null;
  summaryEndDate: Date | null;
  isLoading?: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ 
  selectedDateStats, 
  summaryStartDate, 
  summaryEndDate,
  isLoading = false 
}) => {
  const { formatDate } = useDateFormat();

  const formatCurrency = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return amount < 0 ? `₱-${formatted}` : `₱${formatted}`;
  };

  const SummaryCard: React.FC<SummaryCardProps> = ({ title, data }) => {
    const isFiltered = summaryStartDate && summaryEndDate && 
      !(summaryStartDate.toDateString() === new Date().toDateString() && 
        summaryEndDate.toDateString() === new Date().toDateString());
    
    return (
      <LayoutCard className="min-h-[310px]">
        <div className="flex justify-between items-start mb-7 mt-1">
          <h3 className="text-lg font-semibold text-gray-900 underline">{title}</h3>
          {isFiltered && (
            <div className="text-right text-xs text-gray-600">
              {summaryStartDate && summaryEndDate && (
                summaryStartDate.toDateString() === summaryEndDate.toDateString() ? (
                  <div>{formatDate(summaryStartDate)}</div>
                ) : (
                  <div>{formatDate(summaryStartDate)} - {formatDate(summaryEndDate)}</div>
                )
              )}
            </div>
          )}
        </div>
        <div className="space-y-3">
          {data.map((item, index) => {
            const isHighlight =
                item.label === 'Total Charges' || (title.includes('JuanPay') && item.label === 'Sales');
            const isEmpty = item.label === '';
            return (
              <div
                key={index}
                className={`flex justify-between items-center ${
                  isHighlight ? 'pt-2 mt-2 border-t border-gray-200' : ''
                } ${isEmpty ? 'h-6' : ''}`}
              >
                <span
                  className={`text-sm ${
                    isHighlight ? 'text-gray-900 font-bold' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
                <span
                  className={`${
                    isHighlight ? 'text-red-500 font-medium' : item.value.includes('-')
                      ? 'text-red-500 font-medium'
                      : 'text-gray-900 font-medium'
                  }`}
                >
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </LayoutCard>
    );
  };

  const gcashData = selectedDateStats ? [
    { label: 'Cash-In', value: formatCurrency(selectedDateStats.gcash.cashIn) },
    { label: 'Cash-In Charges', value: formatCurrency(selectedDateStats.gcash.cashInCharges) },
    { label: 'Cash-Out', value: formatCurrency(selectedDateStats.gcash.cashOut) },
    { label: 'Cash-Out Charges', value: formatCurrency(selectedDateStats.gcash.cashOutCharges) },
    { label: 'Total Charges', value: formatCurrency(selectedDateStats.gcash.totalCharges) }
  ] : [
    { label: 'Cash-In', value: formatCurrency(0) },
    { label: 'Cash-In Charges', value: formatCurrency(0) },
    { label: 'Cash-Out', value: formatCurrency(0) },
    { label: 'Cash-Out Charges', value: formatCurrency(0) },
    { label: 'Total Charges', value: formatCurrency(0) }
  ];

  const paymayaData = selectedDateStats ? [
    { label: 'Cash-In', value: formatCurrency(selectedDateStats.paymaya.cashIn) },
    { label: 'Cash-In Charges', value: formatCurrency(selectedDateStats.paymaya.cashInCharges) },
    { label: 'Cash-Out', value: formatCurrency(selectedDateStats.paymaya.cashOut) },
    { label: 'Cash-Out Charges', value: formatCurrency(selectedDateStats.paymaya.cashOutCharges) },
    { label: 'Total Charges', value: formatCurrency(selectedDateStats.paymaya.totalCharges) }
  ] : [
    { label: 'Cash-In', value: formatCurrency(0) },
    { label: 'Cash-In Charges', value: formatCurrency(0) },
    { label: 'Cash-Out', value: formatCurrency(0) },
    { label: 'Cash-Out Charges', value: formatCurrency(0) },
    { label: 'Total Charges', value: formatCurrency(0) }
  ];

  const juanpayData = selectedDateStats ? [
    { label: 'Beginning Balance', value: formatCurrency(selectedDateStats.juanpay.beginning) },
    { label: 'Ending Balance', value: formatCurrency(selectedDateStats.juanpay.ending) },
    { label: 'Average per Record', value: formatCurrency(selectedDateStats.juanpay.avgSales) },
    { label: '', value: '' },
    { label: 'Sales', value: formatCurrency(selectedDateStats.juanpay.sales) }
  ] : [
    { label: 'Beginning Balance', value: formatCurrency(0) },
    { label: 'Ending Balance', value: formatCurrency(0) },
    { label: 'Average per Record', value: formatCurrency(0) },
    { label: '', value: '' },
    { label: 'Sales', value: formatCurrency(0) }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <LayoutCard key={i} className="min-h-[273px] animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="space-y-6.5">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="flex justify-between items-center">
                  <div
                    className={`h-4 rounded w-28 ${
                      j === 5 ? "bg-gray-200" : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`h-4 rounded w-20 ${
                      j === 5 ? "bg-red-200" : "bg-gray-200"
                    }`}
                  ></div>
                </div>
              ))}
            </div>
          </LayoutCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SummaryCard 
        title={summaryStartDate && summaryEndDate && 
              !(summaryStartDate.toDateString() === new Date().toDateString() && 
                summaryEndDate.toDateString() === new Date().toDateString()) 
              ? "GCash (Filtered)" : "GCash Daily"} 
        data={gcashData} 
      />
      <SummaryCard 
        title={summaryStartDate && summaryEndDate && 
              !(summaryStartDate.toDateString() === new Date().toDateString() && 
                summaryEndDate.toDateString() === new Date().toDateString()) 
              ? "PayMaya (Filtered)" : "PayMaya Daily"} 
        data={paymayaData} 
      />
      <SummaryCard 
        title={summaryStartDate && summaryEndDate && 
              !(summaryStartDate.toDateString() === new Date().toDateString() && 
                summaryEndDate.toDateString() === new Date().toDateString()) 
              ? "JuanPay (Filtered)" : "JuanPay Daily"} 
        data={juanpayData} 
      />
    </div>
  );
};

export default SummaryCards;
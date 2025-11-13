import React, { useState, useMemo } from 'react';
import type { 
  GCashRecord,
  PayMayaRecord
} from '../../../types/ewallet_types';
import OverviewStats from './OverviewStats';
import OverviewFilters from './OverviewFilters';
import OverviewSummaryCards from './OverviewSummaryCards';
import OverviewRecordCards from './OverviewRecordCards';

interface OverviewProps {
  gcashRecords: GCashRecord[];
  paymayaRecords: PayMayaRecord[];
}

const Overview: React.FC<OverviewProps> = ({ gcashRecords, paymayaRecords }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [dateRangeWarning, setDateRangeWarning] = useState<string>('');

  // Calculate overall statistics with date range filter
  const overallStats = useMemo(() => {
    const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const filterByDateRange = (record: GCashRecord | PayMayaRecord) => {
      if (!startDate && !endDate) return true;

      const recordYmd = record.date;
      const startStr = startDate ? toYMD(startDate) : null;
      const endStr = endDate ? toYMD(endDate) : null;

      if (startStr && endStr && startStr > endStr) {
        return false;
      }
      if (startStr && endStr) {
        const s = startStr <= endStr ? startStr : endStr;
        const e = startStr <= endStr ? endStr : startStr;
        return recordYmd >= s && recordYmd <= e;
      } else if (startStr) {
        return recordYmd >= startStr;
      } else if (endStr) {
        return recordYmd <= endStr;
      }
      return true;
    };

    const filteredGCash = gcashRecords.filter(filterByDateRange);
    const filteredPayMaya = paymayaRecords.filter(filterByDateRange);

    const gcashCashIn = filteredGCash
      .filter(r => r.transactionType === 'Cash-In')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const gcashCashInCharges = filteredGCash
      .filter(r => r.transactionType === 'Cash-In')
      .reduce((sum, r) => sum + r.serviceCharge, 0);
    
    const gcashCashOut = filteredGCash
      .filter(r => r.transactionType === 'Cash-Out')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const gcashCashOutCharges = filteredGCash
      .filter(r => r.transactionType === 'Cash-Out')
      .reduce((sum, r) => sum + r.serviceCharge, 0);

    const paymayaCashIn = filteredPayMaya
      .filter(r => r.transactionType === 'Cash-In')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const paymayaCashInCharges = filteredPayMaya
      .filter(r => r.transactionType === 'Cash-In')
      .reduce((sum, r) => sum + r.serviceCharge, 0);
    
    const paymayaCashOut = filteredPayMaya
      .filter(r => r.transactionType === 'Cash-Out')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const paymayaCashOutCharges = filteredPayMaya
      .filter(r => r.transactionType === 'Cash-Out')
      .reduce((sum, r) => sum + r.serviceCharge, 0);

    return {
      totalCashIn: gcashCashIn + paymayaCashIn,
      totalCashInCharges: gcashCashInCharges + paymayaCashInCharges,
      totalCashOut: gcashCashOut + paymayaCashOut,
      totalCashOutCharges: gcashCashOutCharges + paymayaCashOutCharges,
    };
  }, [gcashRecords, paymayaRecords, startDate, endDate]);

  // Calculate stats for selected date
  const selectedDateStats = useMemo(() => {
    if (!selectedDate) return null;

    const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    const gcashForDate = gcashRecords.filter(r => r.date === selectedDateStr);
    const paymayaForDate = paymayaRecords.filter(r => r.date === selectedDateStr);

    const gcashCashIn = gcashForDate
      .filter(r => r.transactionType === 'Cash-In')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const gcashCashInCharges = gcashForDate
      .filter(r => r.transactionType === 'Cash-In')
      .reduce((sum, r) => sum + r.serviceCharge, 0);
    
    const gcashCashOut = gcashForDate
      .filter(r => r.transactionType === 'Cash-Out')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const gcashCashOutCharges = gcashForDate
      .filter(r => r.transactionType === 'Cash-Out')
      .reduce((sum, r) => sum + r.serviceCharge, 0);

    const paymayaCashIn = paymayaForDate
      .filter(r => r.transactionType === 'Cash-In')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const paymayaCashInCharges = paymayaForDate
      .filter(r => r.transactionType === 'Cash-In')
      .reduce((sum, r) => sum + r.serviceCharge, 0);
    
    const paymayaCashOut = paymayaForDate
      .filter(r => r.transactionType === 'Cash-Out')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const paymayaCashOutCharges = paymayaForDate
      .filter(r => r.transactionType === 'Cash-Out')
      .reduce((sum, r) => sum + r.serviceCharge, 0);

    return {
      gcash: {
        cashIn: gcashCashIn,
        cashInCharges: gcashCashInCharges,
        cashOut: gcashCashOut,
        cashOutCharges: gcashCashOutCharges,
        totalCharges: gcashCashInCharges + gcashCashOutCharges,
      },
      paymaya: {
        cashIn: paymayaCashIn,
        cashInCharges: paymayaCashInCharges,
        cashOut: paymayaCashOut,
        cashOutCharges: paymayaCashOutCharges,
        totalCharges: paymayaCashInCharges + paymayaCashOutCharges,
      },
      juanpay: {
        cashIn: 0,
        cashInCharges: 0,
        cashOut: 0,
        cashOutCharges: 0,
        totalCharges: 0,
      },
      totalRecords: gcashForDate.length + paymayaForDate.length,
      gcashRecords: gcashForDate.length,
      paymayaRecords: paymayaForDate.length,
      juanpayRecords: 0,
    };
  }, [gcashRecords, paymayaRecords, selectedDate]);

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const formatCurrency = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return amount < 0 ? `₱-${formatted}` : `₱${formatted}`;
  };

  // Prepare summary data based on selected date
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
    { label: 'Cash-In', value: formatCurrency(selectedDateStats.juanpay.cashIn) },
    { label: 'Cash-In Charges', value: formatCurrency(selectedDateStats.juanpay.cashInCharges) },
    { label: 'Cash-Out', value: formatCurrency(selectedDateStats.juanpay.cashOut) },
    { label: 'Cash-Out Charges', value: formatCurrency(selectedDateStats.juanpay.cashOutCharges) },
    { label: 'Total Charges', value: formatCurrency(selectedDateStats.juanpay.totalCharges) }
  ] : [
    { label: 'Cash-In', value: formatCurrency(0) },
    { label: 'Cash-In Charges', value: formatCurrency(0) },
    { label: 'Cash-Out', value: formatCurrency(0) },
    { label: 'Cash-Out Charges', value: formatCurrency(0) },
    { label: 'Total Charges', value: formatCurrency(0) }
  ];

  return (
    <div className="space-y-6 mt-5 h-[700px]">
      {/* Main Stats Cards */}
      <OverviewStats
        totalCashIn={overallStats.totalCashIn}
        totalCashInCharges={overallStats.totalCashInCharges}
        totalCashOut={overallStats.totalCashOut}
        totalCashOutCharges={overallStats.totalCashOutCharges}
      />

      {/* Date Range Filter */}
      <OverviewFilters
        startDate={startDate}
        endDate={endDate}
        selectedDate={selectedDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSelectedDateChange={setSelectedDate}
        onClearFilter={handleClearFilter}
        dateRangeWarning={dateRangeWarning}
        onWarningChange={setDateRangeWarning}
      />

      {/* Summary Cards */}
      <OverviewSummaryCards
        gcashData={gcashData}
        paymayaData={paymayaData}
        juanpayData={juanpayData}
      />

      {/* Records Cards */}
      <OverviewRecordCards
        totalRecords={gcashRecords.length + paymayaRecords.length}
        gcashRecords={gcashRecords.length}
        paymayaRecords={paymayaRecords.length}
        juanpayRecords={0}
      />
    </div>
  );
};

export default Overview;
import React, { useState, useMemo } from 'react';
import LayoutCard from '../../layout/LayoutCard';
import CustomDatePicker from '../../common/CustomDatePicker';
import { X, Calendar } from 'lucide-react';
import type { 
  SummaryCardProps, 
  RecordCardProps,
  GCashRecord,
  PayMayaRecord
} from '../../../types/ewallet_types';

interface OverviewProps {
  gcashRecords: GCashRecord[];
  paymayaRecords: PayMayaRecord[];
}

const Overview: React.FC<OverviewProps> = ({ gcashRecords, paymayaRecords }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [dateRangeWarning, setDateRangeWarning] = useState<string>('');

  const dateFilterRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
        setShowDateFilter(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleApplyFilter = () => {
    if ((tempStartDate && !tempEndDate) || (!tempStartDate && tempEndDate)) {
      setDateRangeWarning('Both start and end dates are required');
      return;
    }

    if (tempStartDate && tempEndDate && tempStartDate > tempEndDate) {
      setDateRangeWarning('Start date must be before end date');
      return;
    }
    
    setDateRangeWarning('');
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setShowDateFilter(false);
  };

  const handleClearAndClose = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    setStartDate(null);
    setEndDate(null);
    setShowDateFilter(false);
  };

  const SummaryCard: React.FC<SummaryCardProps> = ({ title, data }) => (
    <LayoutCard title={title} className="min-h-[200px]">
      <div className="space-y-3">
        {data.map((item, index) => {
          const isHighlight =
              item.label === 'Total Charges';
          return (
            <div
              key={index}
              className={`flex justify-between items-center ${
                isHighlight ? 'pt-2 mt-2 border-t border-gray-200' : ''
              }`}
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
                    item.value.includes('-')
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

  const RecordCard: React.FC<RecordCardProps> = ({ title, count }) => (
    <LayoutCard className="text-center min-h-[120px]">
      <h3 className="text-gray-500 font-medium mb-2">{title}</h3>
      <div className="text-4xl font-bold text-gray-900">
        {count}
      </div>
    </LayoutCard>
  );

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
    <div className="space-y-6 mt-5 h-[700px]"> {/* Overall Border Height */}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LayoutCard className="bg-blue-500 min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Total Cash In</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(overallStats.totalCashIn)}
          </div>
          <div className="text-sm text-gray-500">Overall</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Total Cash In Charges</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(overallStats.totalCashInCharges)}
          </div>
          <div className="text-sm text-gray-500">Service Fees</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Total Cash Out</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(overallStats.totalCashOut)}
          </div>
          <div className="text-sm text-gray-500">Overall</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h3 className="text-gray-500 font-medium mb-2">Total Cash Out Charges</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(overallStats.totalCashOutCharges)}
          </div>
          <div className="text-sm text-gray-500">Service Fees</div>
        </LayoutCard>
      </div>

      {/* Date Range Filter */}
      <div className="flex h-10.5 items-center justify-between">
        <div className="flex items-center gap-3 relative" ref={dateFilterRef}>
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Calendar className="w-4 h-6" />
            <span className="text-sm font-medium">
              {(startDate && endDate) ? (
                `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              ) : (
                'Filter by Date Range'
              )}
            </span>
          </button>

          {(startDate || endDate) && (
            <button
              onClick={handleClearAndClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Clear date range filter"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {showDateFilter && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 min-w-[320px]">
              <div className="space-y-3">
                {dateRangeWarning && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-3">
                    {dateRangeWarning}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <CustomDatePicker
                    selected={tempStartDate}
                    onChange={(date: Date | null) => {
                      setTempStartDate(date);
                      setDateRangeWarning('');
                    }}
                    className="text-sm w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <CustomDatePicker
                    selected={tempEndDate}
                    onChange={(date: Date | null) => {
                      setTempEndDate(date);
                      setDateRangeWarning('');
                    }}
                    className="text-sm w-full"
                  />
                </div>
                <button
                  onClick={handleApplyFilter}
                  disabled={!tempStartDate}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Date Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Summary cards filter</span>
          <div className="w-[140px]">
            <CustomDatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => setSelectedDate(date)}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SummaryCard title="GCash Daily" data={gcashData} />
        <SummaryCard title="PayMaya Daily" data={paymayaData} />
        <SummaryCard title="JuanPay Daily" data={juanpayData} />
      </div>

      {/* Records Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <RecordCard 
          title="Total Records" 
          count={String(gcashRecords.length + paymayaRecords.length)} 
        />
        <RecordCard 
          title="GCash Records" 
          count={String(gcashRecords.length)} 
        />
        <RecordCard 
          title="PayMaya Records" 
          count={String(paymayaRecords.length)} 
        />
        <RecordCard 
          title="JuanPay Records" 
          count={String(0)} 
        />
      </div>
    </div>
  );
};

export default Overview;
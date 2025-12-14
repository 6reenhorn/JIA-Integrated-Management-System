import React, { useState, useMemo } from 'react';
import CustomDatePicker from '../../common/CustomDatePicker';
import { useDateFormat } from '../../../context/DateFormatContext';
import { X, Calendar } from 'lucide-react';
import OverallStatsCards from './OverallStatsCards';
import SummaryCards from './SummaryCards';
import RecordsCards from './RecordsCards';
import type {
  GCashRecord,
  PayMayaRecord,
  JuanPayRecord
} from '../../../types/ewallet_types';

interface OverviewProps {
  gcashRecords: GCashRecord[];
  paymayaRecords: PayMayaRecord[];
  juanpayRecords: JuanPayRecord[];
  isLoading?: boolean;
}

const Overview: React.FC<OverviewProps> = ({ gcashRecords, paymayaRecords, juanpayRecords, isLoading = false }) => {
  const { formatDate } = useDateFormat();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [summaryStartDate, setSummaryStartDate] = useState<Date | null>(new Date());
  const [summaryEndDate, setSummaryEndDate] = useState<Date | null>(new Date());
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showSummaryDateFilter, setShowSummaryDateFilter] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [tempSummaryStartDate, setTempSummaryStartDate] = useState<Date | null>(null);
  const [tempSummaryEndDate, setTempSummaryEndDate] = useState<Date | null>(null);
  const [dateRangeWarning, setDateRangeWarning] = useState<string>('');
  const [summaryDateRangeWarning, setSummaryDateRangeWarning] = useState<string>('');
  const [isClosingDateFilter, setIsClosingDateFilter] = useState(false);
  const [isClosingSummaryFilter, setIsClosingSummaryFilter] = useState(false);

  const dateFilterRef = React.useRef<HTMLDivElement>(null);
  const summaryDateFilterRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
        setIsClosingDateFilter(true);
        setTimeout(() => {
          setShowDateFilter(false);
          setIsClosingDateFilter(false);
        }, 200);
      }
      if (summaryDateFilterRef.current && !summaryDateFilterRef.current.contains(event.target as Node)) {
        setIsClosingSummaryFilter(true);
        setTimeout(() => {
          setShowSummaryDateFilter(false);
          setIsClosingSummaryFilter(false);
        }, 200);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate overall statistics with date range filter
  const overallStats = useMemo(() => {
    const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const filterByDateRange = (record: GCashRecord | PayMayaRecord | JuanPayRecord) => {
      if (!startDate && !endDate) return true;

      const recordYmd = record.date;
      const startStr = startDate ? toYMD(startDate) : null;
      const endStr = endDate ? toYMD(endDate) : null;

      if (startStr && endStr) {
        return recordYmd >= startStr && recordYmd <= endStr;
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

  // Calculate stats for selected date range
  const selectedDateStats = useMemo(() => {
    if (!summaryStartDate || !summaryEndDate) return null;

    const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const filterByDateRange = (record: GCashRecord | PayMayaRecord | JuanPayRecord) => {
      const recordYmd = record.date;
      const startStr = toYMD(summaryStartDate);
      const endStr = toYMD(summaryEndDate);

      return recordYmd >= startStr && recordYmd <= endStr;
    };

    const gcashForDate = gcashRecords.filter(filterByDateRange);
    const paymayaForDate = paymayaRecords.filter(filterByDateRange);
    const juanpayForDate = juanpayRecords.filter(filterByDateRange);

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

    const juanpayBeginning = juanpayForDate.reduce((sum, r) => {
      const beginnings = Array.isArray(r.beginnings) ? r.beginnings : [];
      const beginningSum = beginnings.reduce((s, b) => s + (b?.amount || 0), 0);
      return sum + beginningSum;
    }, 0);

    const juanpayEnding = juanpayForDate.reduce((sum, r) => sum + r.ending, 0);
    const juanpaySales = juanpayForDate.reduce((sum, r) => sum + r.sales, 0);
    const juanpayAvgSales = juanpayForDate.length > 0 ? juanpaySales / juanpayForDate.length : 0;

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
        beginning: juanpayBeginning,
        ending: juanpayEnding,
        sales: juanpaySales,
        avgSales: juanpayAvgSales,
      },
      totalRecords: gcashForDate.length + paymayaForDate.length + juanpayForDate.length,
      gcashRecords: gcashForDate.length,
      paymayaRecords: paymayaForDate.length,
      juanpayRecords: juanpayForDate.length,
    };
  }, [gcashRecords, paymayaRecords, juanpayRecords, summaryStartDate, summaryEndDate]);

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
    closeDateFilter();
  };

  const handleClearAndClose = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    setStartDate(null);
    setEndDate(null);
    closeDateFilter();
  };

  const handleApplySummaryFilter = () => {
    if ((tempSummaryStartDate && !tempSummaryEndDate) || (!tempSummaryStartDate && tempSummaryEndDate)) {
      setSummaryDateRangeWarning('Both start and end dates are required');
      return;
    }

    if (tempSummaryStartDate && tempSummaryEndDate && tempSummaryStartDate > tempSummaryEndDate) {
      setSummaryDateRangeWarning('Start date must be before end date');
      return;
    }

    setSummaryDateRangeWarning('');
    setSummaryStartDate(tempSummaryStartDate);
    setSummaryEndDate(tempSummaryEndDate);
    setShowSummaryDateFilter(false);
  };

  const handleClearSummaryFilter = () => {
    setTempSummaryStartDate(null);
    setTempSummaryEndDate(null);
    setSummaryStartDate(new Date());
    setSummaryEndDate(new Date());
    setShowSummaryDateFilter(false);
  };

  const closeDateFilter = () => {
    setIsClosingDateFilter(true);
    setTimeout(() => {
      setShowDateFilter(false);
      setIsClosingDateFilter(false);
    }, 200);
  };

  // Skeleton Loading Component
  if (isLoading) {
    return (
      <div className="space-y-6 mt-5 h-[723px]">
        <OverallStatsCards 
          overallStats={{ totalCashIn: 0, totalCashInCharges: 0, totalCashOut: 0, totalCashOutCharges: 0 }}
          startDate={null}
          endDate={null}
          isLoading={true}
        />

        <div className="flex h-10.5 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 bg-gray-200 rounded-md w-43 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 bg-gray-200 rounded w-33 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-md w-36 animate-pulse"></div>
          </div>
        </div>

        <SummaryCards 
          selectedDateStats={null}
          summaryStartDate={null}
          summaryEndDate={null}
          isLoading={true}
        />

        <RecordsCards 
          gcashRecordsCount={0}
          paymayaRecordsCount={0}
          juanpayRecordsCount={0}
          isLoading={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-5 h-[723px]">
      {/* Overall Stats Cards */}
      <OverallStatsCards 
        overallStats={overallStats}
        startDate={startDate}
        endDate={endDate}
      />

      {/* Date Range Filter */}
      <div className="flex h-10.5 items-center justify-between">
        <div className="flex items-center gap-3 relative" ref={dateFilterRef}>
          <button
            onClick={() => {
              if (showDateFilter) {
                closeDateFilter();
              } else {
                setShowDateFilter(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Calendar className="w-4 h-6" />
            <span className="text-sm font-medium">
              {(startDate && endDate) ? (
                startDate.toDateString() === endDate.toDateString() ? (
                  formatDate(startDate)
                ) : (
                  `${formatDate(startDate)} - ${formatDate(endDate)}`
                )
              ) : (
                'Filter Overall Total'
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
            <div className={`absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 min-w-[320px] ${isClosingDateFilter ? 'animate-dropdown-out' : 'animate-dropdown-in'}`}>
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
                    className="text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                    className="text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleApplyFilter}
                  disabled={!tempStartDate}
                  className="w-full px-4 py-2 bg-[#02367B] text-white rounded-md hover:bg-[#1C4A9E] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Date Range Filter */}
        <div className="flex items-center gap-3 relative" ref={summaryDateFilterRef}>
          <span className="text-sm text-gray-600">Summary cards filter</span>
          <button
            onClick={() => {
              if (showSummaryDateFilter) {
                setIsClosingSummaryFilter(true);
                setTimeout(() => {
                  setShowSummaryDateFilter(false);
                  setIsClosingSummaryFilter(false);
                }, 200);
              } else {
                setShowSummaryDateFilter(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Calendar className="w-4 h-6" />
            <span className="text-sm font-medium">
              {(summaryStartDate && summaryEndDate) ? (
                summaryStartDate.toDateString() === summaryEndDate.toDateString() ? (
                  formatDate(summaryStartDate)
                ) : (
                  `${formatDate(summaryStartDate)} - ${formatDate(summaryEndDate)}`
                )
              ) : (
                'Summary Date Range'
              )}
            </span>
          </button>

          {(summaryStartDate || summaryEndDate) && !(summaryStartDate && summaryEndDate && summaryStartDate.toDateString() === summaryEndDate.toDateString() && summaryStartDate.toDateString() === new Date().toDateString()) && (
            <button
              onClick={handleClearSummaryFilter}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Clear summary date range filter"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {showSummaryDateFilter && (
            <div className={`absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 min-w-[320px] ${isClosingSummaryFilter ? 'animate-dropdown-out' : 'animate-dropdown-in'}`}>
              <div className="space-y-3">
                {summaryDateRangeWarning && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-3">
                    {summaryDateRangeWarning}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <CustomDatePicker
                    selected={tempSummaryStartDate}
                    onChange={(date: Date | null) => {
                      setTempSummaryStartDate(date);
                      setSummaryDateRangeWarning('');
                    }}
                    className="text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <CustomDatePicker
                    selected={tempSummaryEndDate}
                    onChange={(date: Date | null) => {
                      setTempSummaryEndDate(date);
                      setSummaryDateRangeWarning('');
                    }}
                    className="text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleApplySummaryFilter}
                  disabled={!tempSummaryStartDate}
                  className="w-full px-4 py-2 bg-[#02367B] text-white rounded-md hover:bg-[#1C4A9E] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards 
        selectedDateStats={selectedDateStats}
        summaryStartDate={summaryStartDate}
        summaryEndDate={summaryEndDate}
      />

      {/* Records Cards */}
      <RecordsCards 
        gcashRecordsCount={gcashRecords.length}
        paymayaRecordsCount={paymayaRecords.length}
        juanpayRecordsCount={juanpayRecords.length}
      />
    </div>
  );
};

export default Overview;
import React, { useState, useMemo } from 'react';
import LayoutCard from '../../layout/LayoutCard';
import CustomDatePicker from '../../common/CustomDatePicker';
import { useDateFormat } from '../../../context/DateFormatContext';
import { X, Calendar } from 'lucide-react';
import type {
  SummaryCardProps,
  RecordCardProps,
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
  }, [gcashRecords, paymayaRecords, juanpayRecords, startDate, endDate]);

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

    // Calculate JuanPay stats for selected date
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

  //Total Cards Component
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

  // Skeleton Loading Component
  if (isLoading) {
    return (
      <div className="space-y-6 mt-5 h-[723px]">
        {/* Main Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <LayoutCard key={i} className="min-h-[120px] animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-5"></div>
              <div className="h-9 bg-gray-200 rounded w-40 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </LayoutCard>
          ))}
        </div>

        {/* Filter Bar Skeleton */}
        <div className="flex h-10.5 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 bg-gray-200 rounded-md w-43 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 bg-gray-200 rounded w-33 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-md w-36 animate-pulse"></div>
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <LayoutCard key={i} className="min-h-[273px] animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="space-y-6.5">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex justify-between items-center">
                    {/* Left div */}
                    <div
                      className={`h-4 rounded w-28 ${
                        j === 5 ? "bg-gray-200" : "bg-gray-200"
                      }`}
                    ></div>
                    {/* Right div */}
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

        {/* Records Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <LayoutCard key={i} className="text-center min-h-[120px] animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-16 mx-auto"></div>
            </LayoutCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-5 h-[723px]"> {/* Overall Border Height */}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LayoutCard className="bg-blue-500 min-h-[120px]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 font-medium">Total Cash In</h3>
            {(startDate && endDate) && (
              <div className="text-right text-xs text-gray-600">
                {startDate.toDateString() === endDate.toDateString() ? (
                  <div>{formatDate(startDate)}</div>
                ) : (
                  <div>{formatDate(startDate)} - {formatDate(endDate)}</div>
                )}
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(overallStats.totalCashIn)}
          </div>
          <div className="text-sm text-gray-500">Overall</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 font-medium">Total Cash In Charges</h3>
            {(startDate && endDate) && (
              <div className="text-right text-xs text-gray-600">
                {startDate.toDateString() === endDate.toDateString() ? (
                  <div>{formatDate(startDate)}</div>
                ) : (
                  <div>{formatDate(startDate)} - {formatDate(endDate)}</div>
                )}
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(overallStats.totalCashInCharges)}
          </div>
          <div className="text-sm text-gray-500">Service Fees</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 font-medium">Total Cash Out</h3>
            {(startDate && endDate) && (
              <div className="text-right text-xs text-gray-600">
                {startDate.toDateString() === endDate.toDateString() ? (
                  <div>{formatDate(startDate)}</div>
                ) : (
                  <div>{formatDate(startDate)} - {formatDate(endDate)}</div>
                )}
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(overallStats.totalCashOut)}
          </div>
          <div className="text-sm text-gray-500">Overall</div>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 font-medium">Total Cash Out Charges</h3>
            {(startDate && endDate) && (
              <div className="text-right text-xs text-gray-600">
                {startDate.toDateString() === endDate.toDateString() ? (
                  <div>{formatDate(startDate)}</div>
                ) : (
                  <div>{formatDate(startDate)} - {formatDate(endDate)}</div>
                )}
              </div>
            )}
          </div>
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

      {/* Records Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <RecordCard
          title="Total Records"
          count={String(gcashRecords.length + paymayaRecords.length + juanpayRecords.length)}
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
          count={String(juanpayRecords.length)}
        />
      </div>
    </div>
  );
};

export default Overview;
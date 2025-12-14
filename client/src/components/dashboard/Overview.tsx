import React, { useState, useMemo, useEffect, useRef } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package } from 'lucide-react';

const LayoutCard = React.memo(({ title, children, className = "" }: any) => (
  <div className={`bg-gray-100 border-2 border-[#E5E7EB] rounded-[12px] p-6 shadow-sm min-h-[150px] ${className}`}>
    {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
    {children}
  </div>
));
LayoutCard.displayName = 'LayoutCard';

const Overview: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [ewalletTimeRange, setEwalletTimeRange] = useState('daily');

  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [salesRecords, setSalesRecords] = useState<any[]>([]);
  const [gcashRecords, setGcashRecords] = useState<any[]>([]);
  const [paymayaRecords, setPaymayaRecords] = useState<any[]>([]);
  const [juanpayRecords, setJuanpayRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  // Track if component is mounted to avoid duplicate fetches
  const hasFetchedRef = useRef(false);

  // Extract fetch function so it can be reused
  const fetchAllData = React.useCallback(async () => {
      console.log('Overview: Fetching data...');
      try {
        const [inventory, sales, gcash, paymaya, juanpay, employeeData] = await Promise.allSettled([
          axios.get('http://localhost:3001/api/inventory'),
          axios.get('http://localhost:3001/api/inventory/sales'),
          axios.get('http://localhost:3001/api/gcash'),
          axios.get('http://localhost:3001/api/paymaya'),
          axios.get('http://localhost:3001/api/juanpay'),
          axios.get('http://localhost:3001/api/employees'),
        ]);

        // Handle each response individually to prevent one failure from breaking all
        if (inventory.status === 'fulfilled') {
          setInventoryItems(inventory.value.data || []);
        } else {
          const error = inventory.reason;
          const isConnectionError = error?.code === 'ERR_CONNECTION_REFUSED' || 
                                   error?.code === 'ERR_NETWORK' ||
                                   error?.code === 'ECONNREFUSED' ||
                                   error?.message?.includes('ECONNREFUSED') ||
                                   error?.message?.includes('Network Error') ||
                                   error?.request?.status === 0;
          if (isConnectionError) {
            console.warn('Server not available. Please ensure the server is running on port 3001.');
          } else {
            console.error('Error fetching inventory:', error);
          }
          setInventoryItems([]);
        }

        if (sales.status === 'fulfilled') {
          setSalesRecords(sales.value.data || []);
        } else {
          const error = sales.reason;
          const isConnectionError = error?.code === 'ERR_CONNECTION_REFUSED' || 
                                   error?.code === 'ERR_NETWORK' ||
                                   error?.code === 'ECONNREFUSED' ||
                                   error?.message?.includes('ECONNREFUSED') ||
                                   error?.message?.includes('Network Error') ||
                                   error?.request?.status === 0;
          if (isConnectionError) {
            console.warn('Server not available for sales data.');
          } else {
            console.error('Error fetching sales:', sales.reason);
          }
          setSalesRecords([]);
        }

        if (gcash.status === 'fulfilled') {
          setGcashRecords(gcash.value.data || []);
        } else {
          const error = gcash.reason;
          const isConnectionError = error?.code === 'ERR_CONNECTION_REFUSED' || 
                                   error?.code === 'ERR_NETWORK' ||
                                   error?.code === 'ECONNREFUSED' ||
                                   error?.message?.includes('ECONNREFUSED') ||
                                   error?.message?.includes('Network Error') ||
                                   error?.request?.status === 0;
          if (isConnectionError) {
            console.warn('Server not available for GCash data.');
          } else {
            console.error('Error fetching GCash:', gcash.reason);
          }
          setGcashRecords([]);
        }

        if (paymaya.status === 'fulfilled') {
          setPaymayaRecords(paymaya.value.data || []);
        } else {
          const error = paymaya.reason;
          const isConnectionError = error?.code === 'ERR_CONNECTION_REFUSED' || 
                                   error?.code === 'ERR_NETWORK' ||
                                   error?.code === 'ECONNREFUSED' ||
                                   error?.message?.includes('ECONNREFUSED') ||
                                   error?.message?.includes('Network Error') ||
                                   error?.request?.status === 0;
          if (isConnectionError) {
            console.warn('Server not available for PayMaya data.');
          } else {
            console.error('Error fetching PayMaya:', paymaya.reason);
          }
          setPaymayaRecords([]);
        }

        if (juanpay.status === 'fulfilled') {
          setJuanpayRecords(juanpay.value.data || []);
        } else {
          const error = juanpay.reason;
          const isConnectionError = error?.code === 'ERR_CONNECTION_REFUSED' || 
                                   error?.code === 'ERR_NETWORK' ||
                                   error?.code === 'ECONNREFUSED' ||
                                   error?.message?.includes('ECONNREFUSED') ||
                                   error?.message?.includes('Network Error') ||
                                   error?.request?.status === 0;
          if (isConnectionError) {
            console.warn('Server not available for JuanPay data.');
          } else {
            console.error('Error fetching JuanPay:', juanpay.reason);
          }
          setJuanpayRecords([]);
        }

        if (employeeData.status === 'fulfilled') {
          setEmployees(employeeData.value.data || []);
        } else {
          const error = employeeData.reason;
          const isConnectionError = error?.code === 'ERR_CONNECTION_REFUSED' || 
                                   error?.code === 'ERR_NETWORK' ||
                                   error?.code === 'ECONNREFUSED' ||
                                   error?.message?.includes('ECONNREFUSED') ||
                                   error?.message?.includes('Network Error') ||
                                   error?.request?.status === 0;
          if (isConnectionError) {
            console.warn('Server not available for employees data.');
          } else {
            console.error('Error fetching employees:', employeeData.reason);
          }
          setEmployees([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty arrays as fallback
        setInventoryItems([]);
        setSalesRecords([]);
        setGcashRecords([]);
        setPaymayaRecords([]);
        setJuanpayRecords([]);
        setEmployees([]);
      }
  }, []); // Empty deps - function is stable

  // Fetch immediately on mount - this runs as soon as the component is rendered
  useEffect(() => {
    console.log('Overview: Component mounted, fetching data immediately');
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchAllData();
    } else {
      // If component remounts (e.g., navigating back to dashboard), refetch
      console.log('Overview: Component remounted, refetching data');
      fetchAllData();
    }
  }, [fetchAllData]); // Fetch data when component mounts or remounts

  // Also refetch when component becomes visible (debounced to prevent excessive calls)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Debounce refetch to prevent excessive API calls
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          fetchAllData();
        }, 1000); // Wait 1 second after tab becomes visible
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchAllData]);

  // Pre-process sales records by date for faster lookups
  const salesByDate = useMemo(() => {
    const map = new Map<string, number>();
    salesRecords.forEach((sale: any) => {
      const dateStr = sale.date;
      const total = Number(sale.total) || 0;
      map.set(dateStr, (map.get(dateStr) || 0) + total);
    });
    return map;
  }, [salesRecords]);

  // Calculate revenue data from sales with optimized filtering
  const revenueData = useMemo(() => {
    if (timeRange === 'week') {
      const last7Days = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        const revenue = salesByDate.get(dateStr) || 0;
        const expenses = revenue * 0.6;
        
        last7Days.push({
          name: dayName,
          revenue,
          expenses
        });
      }
      
      return last7Days;
    } else if (timeRange === 'month') {
      const daysInMonth = 31;
      const monthlyData: { name: string; revenue: number; expenses: number }[] = [];
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      for (let day = 1; day <= daysInMonth; day++) {
        let revenue = 0;
        salesByDate.forEach((total, dateStr) => {
          const saleDate = new Date(dateStr);
          if (saleDate.getDate() === day && saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
            revenue += total;
          }
        });
        const expenses = revenue * 0.6;
        monthlyData.push({
          name: day.toString(),
          revenue,
          expenses,
        });
      }
      return monthlyData;
    } else {
      const last12Months = [];
      const year = new Date().getFullYear();
      for (let month = 0; month < 12; month++) {
        const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'short' });
        
        let revenue = 0;
        salesByDate.forEach((total, dateStr) => {
          const saleDate = new Date(dateStr);
          if (saleDate.getFullYear() === year && saleDate.getMonth() === month) {
            revenue += total;
          }
        });
        const expenses = revenue * 0.6;
        
        last12Months.push({
          name: monthName,
          revenue,
          expenses
        });
      }
      
      return last12Months;
    }
  }, [salesByDate, timeRange]);
  
  // Pre-process inventory items by product name for faster lookups
  const inventoryByProduct = useMemo(() => {
    const map = new Map<string, string>();
    inventoryItems.forEach((item: any) => {
      map.set(item.productName, item.category || 'Uncategorized');
    });
    return map;
  }, [inventoryItems]);

  // Calculate category data from inventory with optimized filtering
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, { name: string; value: number; sales: number }>();
    
    // Calculate date threshold once
    const today = new Date();
    let thresholdDate: Date;
    if (timeRange === 'week') {
      thresholdDate = new Date(today);
      thresholdDate.setDate(thresholdDate.getDate() - 7);
    } else if (timeRange === 'month') {
      thresholdDate = new Date(today);
      thresholdDate.setMonth(thresholdDate.getMonth() - 1);
    } else if (timeRange === 'year') {
      thresholdDate = new Date(today);
      thresholdDate.setFullYear(thresholdDate.getFullYear() - 1);
    } else {
      thresholdDate = new Date(0); // All time
    }
    
    // Single pass through sales records
    salesRecords.forEach((sale: any) => {
      const saleDate = new Date(sale.date);
      if (saleDate >= thresholdDate) {
        const key = inventoryByProduct.get(sale.productName) ?? 'Uncategorized';
        const total = Number(sale.total) || 0;
        
      if (!categoryMap.has(key)) {
        categoryMap.set(key, { name: key, value: 0, sales: 0 });
      }
      const cat = categoryMap.get(key)!;
      cat.sales += total;
      }
    });
    
    const total = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.sales, 0);
    
    return Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      value: total > 0 ? Math.round((cat.sales / total) * 100) : 0
    }));
  }, [inventoryByProduct, salesRecords, timeRange]);

  // Calculate top products from sales (optimized single pass)
  const topProducts = useMemo(() => {
    const productMap = new Map<string, { name: string; sales: number; revenue: number }>();
    
    // Single pass through sales records
    salesRecords.forEach((sale: any) => {
      const name = sale?.productName ?? 'Unknown Product';
      const quantity = Number(sale.quantity) || 0;
      const total = Number(sale.total) || 0;
      
      if (!productMap.has(name)) {
        productMap.set(name, { name, sales: 0, revenue: 0 });
      }
      const product = productMap.get(name)!;
      product.sales += quantity;
      product.revenue += total;
    });
    
    // Convert to array, sort, and slice in one operation
    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 products
  }, [salesRecords]);

  // Pre-process e-wallet records by date for faster lookups
  const ewalletByDate = useMemo(() => {
    const gcashMap = new Map<string, number>();
    const paymayaMap = new Map<string, number>();
    const juanpayMap = new Map<string, number>();

    gcashRecords.forEach((record: any) => {
      const dateStr = record.date;
      const amount = Number(record.amount) || 0;
      gcashMap.set(dateStr, (gcashMap.get(dateStr) || 0) + amount);
    });

    paymayaRecords.forEach((record: any) => {
      const dateStr = record.date;
      const amount = Number(record.amount) || 0;
      paymayaMap.set(dateStr, (paymayaMap.get(dateStr) || 0) + amount);
    });

    juanpayRecords.forEach((record: any) => {
      const dateStr = record.date;
      const endings = Number(record.ending) || 0;
      const beginnings = Array.isArray(record.beginnings)
        ? record.beginnings.reduce((s: number, b: any) => s + (Number(b.amount) || 0), 0)
        : 0;
      const amount = Math.abs(endings - beginnings);
      juanpayMap.set(dateStr, (juanpayMap.get(dateStr) || 0) + amount);
    });

    return { gcashMap, paymayaMap, juanpayMap };
  }, [gcashRecords, paymayaRecords, juanpayRecords]);

  // Calculate e-wallet data with optimized lookups
  const ewalletData = useMemo(() => {
    if (ewalletTimeRange === 'daily') {
      const last7Days = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        const gcashDay = ewalletByDate.gcashMap.get(dateStr) || 0;
        const paymayaDay = ewalletByDate.paymayaMap.get(dateStr) || 0;
        const juanpayDay = ewalletByDate.juanpayMap.get(dateStr) || 0;

        last7Days.push({
          name: dayName,
          gcash: gcashDay,
          paymaya: paymayaDay,
          juanpay: juanpayDay
        });
      }
      return last7Days;
    } else if (ewalletTimeRange === 'monthly') {
      const last6Months = [];
      const today = new Date();

      for (let i = 5; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();
        const month = date.getMonth();

        let gcashMonth = 0;
        let paymayaMonth = 0;
        let juanpayMonth = 0;

        ewalletByDate.gcashMap.forEach((amount, dateStr) => {
          const recordDate = new Date(dateStr);
          if (recordDate.getFullYear() === year && recordDate.getMonth() === month) {
            gcashMonth += amount;
          }
        });

        ewalletByDate.paymayaMap.forEach((amount, dateStr) => {
          const recordDate = new Date(dateStr);
          if (recordDate.getFullYear() === year && recordDate.getMonth() === month) {
            paymayaMonth += amount;
          }
        });

        ewalletByDate.juanpayMap.forEach((amount, dateStr) => {
          const recordDate = new Date(dateStr);
          if (recordDate.getFullYear() === year && recordDate.getMonth() === month) {
            juanpayMonth += amount;
          }
        });

        last6Months.push({
          name: monthName,
          gcash: gcashMonth,
          paymaya: paymayaMonth,
          juanpay: juanpayMonth
        });
      }
      return last6Months;
    } else {
      const last4Weeks = [];

      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        let gcashWeek = 0;
        let paymayaWeek = 0;
        let juanpayWeek = 0;

        ewalletByDate.gcashMap.forEach((amount, dateStr) => {
          const recordDate = new Date(dateStr);
          if (recordDate >= weekStart && recordDate <= weekEnd) {
            gcashWeek += amount;
          }
        });

        ewalletByDate.paymayaMap.forEach((amount, dateStr) => {
          const recordDate = new Date(dateStr);
          if (recordDate >= weekStart && recordDate <= weekEnd) {
            paymayaWeek += amount;
          }
        });

        ewalletByDate.juanpayMap.forEach((amount, dateStr) => {
          const recordDate = new Date(dateStr);
          if (recordDate >= weekStart && recordDate <= weekEnd) {
            juanpayWeek += amount;
          }
        });

        last4Weeks.push({
          name: `Week ${4 - i}`,
          gcash: gcashWeek,
          paymaya: paymayaWeek,
          juanpay: Math.abs(juanpayWeek)
        });
      }
      return last4Weeks;
    }
  }, [ewalletByDate, ewalletTimeRange]);

  // Calculate dynamic Y-axis domain for revenue chart
  const revenueDomain = useMemo(() => {
    const allValues = revenueData.flatMap(d => [d.revenue, d.expenses]);
    const maxValue = Math.max(...allValues, 0);
    const minValue = Math.min(...allValues, 0);
    
    if (maxValue === 0) return [0, 1000];
    
    // Add 10% padding to top and bottom for better visualization
    const padding = maxValue * 0.1;
    const adjustedMax = maxValue + padding;
    const adjustedMin = Math.max(0, minValue - padding);
    
    return [adjustedMin, adjustedMax];
  }, [revenueData]);

  // Custom Y-axis tick formatter
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `₱${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₱${(value / 1000).toFixed(0)}K`;
    }
    return `₱${value}`;
  };

  // Custom legend component for E-Wallet chart
  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-black">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const ewalletColors = ['#3B82F6', '#EF4444', '#10B981'];
  const categoryColors = ['#6366F1', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#22D3EE'];

  // Calculate statistics
  const totalRevenue = useMemo(() => 
    salesRecords.reduce((sum, sale) => sum + sale.total, 0), 
    [salesRecords]
  );

  const totalSales = useMemo(() => 
    salesRecords.length, 
    [salesRecords]
  );

  const inventoryValue = useMemo(() =>
    inventoryItems.reduce((sum, item) => sum + item.totalAmount, 0),
    [inventoryItems]
  );

  const lowStockItems = useMemo(() =>
    inventoryItems.filter(item => item.status === 'Low Stock' || item.status === 'Out Of Stock').length,
    [inventoryItems]
  );

  const todaySales = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return salesRecords
      .filter(sale => sale.date === today)
      .reduce((sum, sale) => sum + sale.total, 0);
  }, [salesRecords]);

  const activeEmployees = useMemo(() =>
    employees.filter(emp => emp.status === 'Active').length,
    [employees]
  );

  const totalEmployees = employees.length;

  const stats = useMemo(() => [
    {
      title: 'Total Revenue',
      value: `₱${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'From all sales',
    },
    {
      title: 'Total Sales',
      value: totalSales,
      subtitle: 'Transactions',
    },
    {
      title: 'Inventory Value',
      value: `₱${inventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Current stock value',
    },
    {
      title: 'Low Stock Alerts',
      value: lowStockItems,
      subtitle: lowStockItems > 0 ? `${lowStockItems} items need attention` : 'All items stocked',
    },
  ], [totalRevenue, totalSales, inventoryValue, lowStockItems]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <LayoutCard key={index} className="min-h-[120px]">
            <h3 className="text-gray-500 font-medium mb-2">{stat.title}</h3>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.subtitle}</div>
          </LayoutCard>
        ))}
      </div>

      {/* Revenue Chart and Category Distribution */} 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend - Technical Line Chart */}
        <LayoutCard className="lg:col-span-2 min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
            <div className="flex gap-2">
              {['week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-[#02367B] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                tickFormatter={formatYAxis}
                domain={revenueDomain}
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: string) => [
                  `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  name === 'revenue' ? 'Revenue' : 'Expenses'
                ]}
                labelFormatter={(label) => `Day: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                strokeWidth={2.5}
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Revenue" 
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                strokeWidth={2.5}
                dot={{ fill: '#EF4444', r: 4 }}
                activeDot={{ r: 6 }}
                name="Expenses" 
              />
            </LineChart>
          </ResponsiveContainer>
        </LayoutCard>

        {/* Sales by Category */}
        <LayoutCard className="min-h-[400px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales by Category</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  {/* Custom renderLabel to add lines and smaller text */}
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={true}
                    label={renderCustomizedLabel}
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[index % categoryColors.length] }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">₱{item.sales.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No category data available
            </div>
          )}
        </LayoutCard>
      </div>

      {/* E-Wallet Transactions and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* E-Wallet Transactions */}
        <LayoutCard className="min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">E-Wallet Transactions</h3>
            <div className="flex gap-2">
              {['daily', 'monthly', 'weekly'].map(range => (
                <button
                  key={range}
                  onClick={() => setEwalletTimeRange(range)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    ewalletTimeRange === range
                      ? 'bg-[#02367B] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ewalletData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend content={<CustomLegend />} />
              <Bar dataKey="gcash" fill={ewalletColors[0]} radius={[4, 4, 0, 0]} name="GCash" />
              <Bar dataKey="paymaya" fill={ewalletColors[1]} radius={[4, 4, 0, 0]} name="PayMaya" />
              <Bar dataKey="juanpay" fill={ewalletColors[2]} radius={[4, 4, 0, 0]} name="JuanPay" />
            </BarChart>
          </ResponsiveContainer>
        </LayoutCard>

        {/* Top Products - Table Style */}
        <LayoutCard className="min-h-[400px] ">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Selling Products</h3>
          {topProducts.length > 0 ? (
            <div className="border-2 border-[#E5E7EB] rounded-lg overflow-hidden ">
              <div className="max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <table className="w-full">
                  <thead className="bg-[#EDEDED] border-b border-[#E5E7EB] sticky top-0 ">
                    <tr>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 w-[60px]">#</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Product</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Units</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500w-[190px]">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            index === 0 
                              ? 'bg-red-500' 
                              : index === 1 
                              ? 'bg-blue-500' 
                              : index === 2 
                              ? 'bg-green-500'
                              : 'bg-gray-500'
                          }`}>
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-6.5 text-sm text-gray-600">{product.sales}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-semibold text-gray-900">
                            ₱{product.revenue.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No sales data available
            </div>
          )}
        </LayoutCard>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LayoutCard className="min-h-[120px]">
          <h4 className="text-gray-500 font-medium mb-2">Today's Sales</h4>
          <p className="text-3xl font-bold text-gray-900 mb-1">₱{todaySales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-sm text-gray-500">Real-time data</p>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h4 className="text-gray-500 font-medium mb-2">Active Employees</h4>
          <p className="text-3xl font-bold text-gray-900 mb-1">{activeEmployees} / {totalEmployees}</p>
          <p className="text-sm text-gray-500">
            {totalEmployees > 0 ? `${Math.round((activeEmployees / totalEmployees) * 100)}%` : '0%'} active rate
          </p>
        </LayoutCard>
        <LayoutCard className="min-h-[120px]">
          <h4 className="text-gray-500 font-medium mb-2">Stock Status</h4>
          <p className="text-3xl font-bold text-gray-900 mb-1">{inventoryItems.length}</p>
          <p className="text-sm text-gray-500">{lowStockItems} low stock items</p>
        </LayoutCard>
      </div>
    </div>
  );
};


// Custom label renderer for pie chart with connecting lines and smaller text
const renderCustomizedLabel = ({
  cx, cy, midAngle, outerRadius, name, value
}: any) => {
  const RADIAN = Math.PI / 180;

  const lineRadius = outerRadius + 10;
  const labelRadius = outerRadius + 25;

  const lineX = cx + lineRadius * Math.cos(-midAngle * RADIAN);
  const lineY = cy + lineRadius * Math.sin(-midAngle * RADIAN);

  const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
  const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      <path d={`M${lineX},${lineY} L${x},${y}`} stroke="#888" fill="none" />
      <circle cx={x} cy={y} r={2} fill="#888" stroke="none" />
      <text
        x={x > cx ? x + 8 : x - 8}
        y={y}
        fill="#666"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={10} 
        style={{ userSelect: 'none' }}
      >
        {`${name}: ${value}%`}
      </text>
    </g>
  );
};

export default Overview;
import React, { createContext, useContext, useState, useEffect } from 'react';

type DateFormat = 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd' | 'dd-MMM-yyyy';

interface DateFormatContextType {
  dateFormat: DateFormat;
  setDateFormat: (format: DateFormat) => void;
  formatDate: (date: Date | string) => string;
}

const DateFormatContext = createContext<DateFormatContextType | undefined>(undefined);

export const DateFormatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dateFormat, setDateFormatState] = useState<DateFormat>(() => {
    const saved = localStorage.getItem('dateFormat');
    return (saved as DateFormat) || 'MM/dd/yyyy';
  });

  useEffect(() => {
    localStorage.setItem('dateFormat', dateFormat);
  }, [dateFormat]);

  const setDateFormat = (format: DateFormat) => {
    setDateFormatState(format);
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '';

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = monthNames[dateObj.getMonth()];

    switch (dateFormat) {
      case 'MM/dd/yyyy':
        return `${month}/${day}/${year}`;
      case 'dd/MM/yyyy':
        return `${day}/${month}/${year}`;
      case 'yyyy-MM-dd':
        return `${year}-${month}-${day}`;
      case 'dd-MMM-yyyy':
        return `${day}-${monthName}-${year}`;
      default:
        return `${month}/${day}/${year}`;
    }
  };

  return (
    <DateFormatContext.Provider value={{ dateFormat, setDateFormat, formatDate }}>
      {children}
    </DateFormatContext.Provider>
  );
};

export const useDateFormat = () => {
  const context = useContext(DateFormatContext);
  if (!context) {
    throw new Error('useDateFormat must be used within DateFormatProvider');
  }
  return context;
};
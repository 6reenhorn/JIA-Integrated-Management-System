/* DateFormatContext */
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
    if (!date) return '-';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check if date is invalid
      if (isNaN(dateObj.getTime())) return '-';

      const day = dateObj.getDate();
      const month = dateObj.getMonth();
      const year = dateObj.getFullYear();
      
      // Additional validation to prevent NaN values
      if (isNaN(day) || isNaN(month) || isNaN(year) || 
          day < 1 || day > 31 || month < 0 || month > 11 || year < 1 || year > 9999) {
        return '-';
      }
      
      const dayStr = String(day).padStart(2, '0');
      const monthStr = String(month + 1).padStart(2, '0');
      const yearStr = String(year);
      
      // Final check to ensure no NaN in the strings
      if (dayStr.includes('NaN') || monthStr.includes('NaN') || yearStr.includes('NaN')) {
        return '-';
      }
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[month];

      let result: string;
      switch (dateFormat) {
        case 'MM/dd/yyyy':
          result = `${monthStr}/${dayStr}/${yearStr}`;
          break;
        case 'dd/MM/yyyy':
          result = `${dayStr}/${monthStr}/${yearStr}`;
          break;
        case 'yyyy-MM-dd':
          result = `${yearStr}-${monthStr}-${dayStr}`;
          break;
        case 'dd-MMM-yyyy':
          result = `${dayStr}-${monthName}-${yearStr}`;
          break;
        default:
          result = `${monthStr}/${dayStr}/${yearStr}`;
      }
      
      // Final safety check - if result contains NaN, return '-'
      if (result.includes('NaN') || result.includes('undefined') || result.includes('null')) {
        return '-';
      }
      
      return result;
    } catch (error) {
      console.error('Error in formatDate:', error, date);
      return '-';
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
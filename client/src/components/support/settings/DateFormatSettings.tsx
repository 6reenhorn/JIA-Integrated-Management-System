import React, { useState } from 'react';
import { useDateFormat } from '../../../context/DateFormatContext';
import DashboardCard from '../../layout/LayoutCard';
import { ChevronDown } from 'lucide-react';

const DateFormatSettings: React.FC = () => {
  const { dateFormat, setDateFormat } = useDateFormat();
  const [isOpen, setIsOpen] = useState(false);

  const formats = [
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY', example: '12/31/2024' },
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY', example: '31/12/2024' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD', example: '2024-12-31' },
    { value: 'dd-MMM-yyyy', label: 'DD-MMM-YYYY', example: '31-Dec-2024' },
  ];

  const currentFormat = formats.find(f => f.value === dateFormat) || formats[0];

  return (
    <DashboardCard title="Date Format">
      <p className="text-gray-600 mb-4 text-sm">
        Choose your preferred date format for the entire application
      </p>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <div className="flex flex-col items-start">
            <span className="font-medium text-gray-900">{currentFormat.label}</span>
            <span className="text-sm text-gray-500">Example: {currentFormat.example}</span>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
            {formats.map((format) => (
              <button
                key={format.value}
                onClick={() => {
                  setDateFormat(format.value as any);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0 ${
                  dateFormat === format.value ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium text-gray-900">{format.label}</span>
                  <span className="text-sm text-gray-500">Example: {format.example}</span>
                </div>
                {dateFormat === format.value && (
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

export default DateFormatSettings;
import React from 'react';
import { useDarkMode } from '../../../context/DarkModeContext';
import DashboardCard from '../../layout/LayoutCard';
import { Moon, Sun } from 'lucide-react';

const DarkModeSettings: React.FC = () => {
  const { isDarkMode, setIsDarkMode } = useDarkMode();

  return (
    <DashboardCard title="Theme">
      <p className="text-gray-600 mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Choose your preferred theme for the entire application
      </p>
      <div className="space-y-2">
        <button
          onClick={() => setIsDarkMode(false)}
          className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-lg transition-colors ${
            !isDarkMode 
              ? 'bg-blue-50 border-blue-500' 
              : 'border-gray-300 hover:bg-gray-200'
          }`}
          style={{
            backgroundColor: !isDarkMode ? '#dbeafe' : 'var(--input-bg)',
            borderColor: !isDarkMode ? '#3b82f6' : 'var(--border-color)',
          }}
        >
          <div className="flex items-center gap-3">
            <Sun className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            <div className="flex flex-col items-start">
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Light Mode</span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Default bright theme</span>
            </div>
          </div>
          {!isDarkMode && (
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        <button
          onClick={() => setIsDarkMode(true)}
          className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-blue-50 border-blue-500' 
              : 'border-gray-300 hover:bg-gray-200'
          }`}
          style={{
            backgroundColor: isDarkMode ? '#dbeafe' : 'var(--input-bg)',
            borderColor: isDarkMode ? '#3b82f6' : 'var(--border-color)',
          }}
        >
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            <div className="flex flex-col items-start">
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Dark Mode</span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Easy on the eyes</span>
            </div>
          </div>
          {isDarkMode && (
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </DashboardCard>
  );
};

export default DarkModeSettings;

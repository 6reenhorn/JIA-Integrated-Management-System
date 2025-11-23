import React from 'react';
import DashboardCard from '../../layout/LayoutCard';

interface SidebarSettingsProps {
  sidebarExpanded: boolean;
  onToggle: (expanded: boolean) => void;
}

const SidebarSettings: React.FC<SidebarSettingsProps> = ({ sidebarExpanded, onToggle }) => {
  return (
    <DashboardCard title="Sidebar Behavior">
      <p className="text-gray-600 mb-4 text-sm">
        Choose whether the sidebar should be expanded when you first launch the app
      </p>
      <div className="space-y-2">
        <button
          onClick={() => onToggle(false)}
          className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-lg transition-colors ${
            !sidebarExpanded 
              ? 'bg-blue-50 border-blue-500' 
              : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
          }`}
        >
          <div className="flex flex-col items-start">
            <span className="font-medium text-gray-900">Collapsed (Default)</span>
            <span className="text-sm text-gray-500">Sidebar starts minimized with icons only</span>
          </div>
          {!sidebarExpanded && (
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        <button
          onClick={() => onToggle(true)}
          className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-lg transition-colors ${
            sidebarExpanded 
              ? 'bg-blue-50 border-blue-500' 
              : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
          }`}
        >
          <div className="flex flex-col items-start">
            <span className="font-medium text-gray-900">Expanded</span>
            <span className="text-sm text-gray-500">Sidebar starts open with full menu visible</span>
          </div>
          {sidebarExpanded && (
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </DashboardCard>
  );
};

export default SidebarSettings;
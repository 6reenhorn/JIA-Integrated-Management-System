import React, { useState } from 'react';
import { LayoutDashboard, Package, Users, Wallet, Settings, Info, X } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  category?: string;
}

export interface SidebarProps {
  activeItem: string;
  onItemClick: (itemId: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick, onToggle }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const mainMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, category: 'Main Menu' },
    { id: 'inventory', label: 'Inventory', icon: <Package size={20} /> },
    { id: 'employees', label: 'Employees', icon: <Users size={20} /> },
    { id: 'e-wallet', label: 'E-Wallet', icon: <Wallet size={20} /> },
  ];

  const supportItems: MenuItem[] = [
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, category: 'Support' },
    { id: 'about', label: 'About', icon: <Info size={20} /> },
  ];

  // Define functional sections for E-Wallet
  const getEWalletSections = () => [
    { id: 'e-wallet-gcash', label: 'GCash' },
    { id: 'e-wallet-paymaya', label: 'PayMaya' },
    { id: 'e-wallet-juanpay', label: 'JuanPay' },
  ];

  // Hardcoded sections for other menu items (for future implementation)
  const getSections = (itemId: string) => {
    switch (itemId) {
      case 'dashboard':
        return [
          { id: 'dashboard-overview', label: 'Overview' },
          { id: 'dashboard-analytics', label: 'Analytics' },
          { id: 'dashboard-reports', label: 'Reports' },
          { id: 'dashboard-statistics', label: 'Statistics' }
        ];
      case 'inventory':
        return [
          { id: 'inventory-products', label: 'Products' },
          { id: 'inventory-categories', label: 'Categories' },
          { id: 'inventory-stock-levels', label: 'Stock Levels' },
          { id: 'inventory-suppliers', label: 'Suppliers' }
        ];
      case 'employees':
        return [
          { id: 'employees-list', label: 'Employee List' },
          { id: 'employees-departments', label: 'Departments' },
          { id: 'employees-attendance', label: 'Attendance' },
          { id: 'employees-payroll', label: 'Payroll' }
        ];
      case 'e-wallet':
        return getEWalletSections();
      case 'settings':
        return [
          { id: 'settings-general', label: 'General' },
          { id: 'settings-security', label: 'Security' },
          { id: 'settings-notifications', label: 'Notifications' },
          { id: 'settings-preferences', label: 'Preferences' }
        ];
      case 'about':
        return [
          { id: 'about-company', label: 'Company Info' },
          { id: 'about-version', label: 'Version' },
          { id: 'about-support', label: 'Support' },
          { id: 'about-license', label: 'License' }
        ];
      default:
        return [];
    }
  };

  // Checker
  const isEWalletSection = (sectionId: string) => {
    return sectionId.startsWith('e-wallet-');
  };

  // Check if item is currently active (including sub-sections)
  const isItemActive = (itemId: string) => {
    return activeItem === itemId || activeItem.startsWith(itemId + '-');
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = isItemActive(item.id);
    const showTooltip = hoveredItem === item.id && !isActive;

    return (
      <li key={item.id} className="relative">
        <button
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => {
            const isCurrentlyInThisModule = isActive;
            //sidebar behavior :)
            if (isCurrentlyInThisModule && expanded === item.id) {
              setExpanded(null);
            } else if (isCurrentlyInThisModule && expanded !== item.id) {
              setExpanded(item.id);
            } else {
              setExpanded(item.id);
              onItemClick(item.id); 
            }
          }}
          className={`w-full flex items-center justify-center gap-3 py-3 px-2 text-left rounded-lg transition-all duration-200 hover:bg-gray-600 ${
            isActive ? 'bg-gray-600 text-white' : 'text-gray-300'
          }`}
        >
          <span className="flex-shrink-0">{item.icon}</span>
        </button>
        
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 ml-2 z-50">
            <div className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg border border-gray-600">
              {item.label}
              {/* Arrow pointing to the button */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
                <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-700"></div>
              </div>
            </div>
          </div>
        )}
      </li>
    );
  };

  // Full sidebar content
  const renderFullSidebar = (itemId: string) => {
    const item = [...mainMenuItems, ...supportItems].find(i => i.id === itemId);
    const sections = getSections(itemId);
    
    return (
      <div className="bg-gray-900 text-white h-full flex flex-col shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <span className="font-bold text-lg whitespace-nowrap">{item?.label || 'Sidebar'}</span>
          <button 
            onClick={() => setExpanded(null)}
            className="hover:bg-gray-700 p-1 rounded transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Show the selected item */}
          <div className="mb-6">
            <button
              onClick={() => onItemClick(itemId)}
              className={`w-full flex items-center gap-3 py-3 px-3 text-left rounded-lg transition-all duration-200 ${
                activeItem === itemId ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="flex-shrink-0">{item?.icon}</span>
              <span className="font-medium whitespace-nowrap">{item?.label}</span>
            </button>
          </div>
          
          {/* Show sections */}
          {sections.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 whitespace-nowrap">Sections</p>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => {
                        // For E-Wallet sections, handle them functionally
                        if (isEWalletSection(section.id)) {
                          onItemClick(section.id);
                        } else {
                          // For other sections, keep them as placeholders for now
                          console.log('Section not implemented yet:', section.id);
                        }
                      }}
                      className={`w-full flex items-center gap-3 py-2 px-4 text-left rounded-lg transition-all duration-200 hover:bg-gray-700 text-sm ${
                        activeItem === section.id ? 'bg-gray-700 text-white' : 'text-gray-300'
                      } ${isEWalletSection(section.id) ? 'cursor-pointer' : 'cursor-default opacity-75'}`}
                    >
                      <span className="whitespace-nowrap">+ {section.label}</span>
                      {!isEWalletSection(section.id) && (
                        <span className="text-xs text-gray-500 ml-auto">(Soon)</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex h-screen">
      {/* Collapsed sidebar with icons only */}
      <div className="bg-gray-800 text-white w-16 min-h-screen flex flex-col py-4 space-y-2 flex-shrink-0">
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mb-4 hover:bg-gray-500 transition-colors duration-200 mx-auto" onClick={onToggle} style={{ cursor: 'pointer' }}>
          <span className="text-sm font-bold">L</span>
        </div>
        
        {/* Main menu items */}
        <div className="flex-1 flex flex-col items-center">
          <ul className="space-y-2 mt-4">
            {mainMenuItems.map(renderMenuItem)}
          </ul>
        </div>
        
        {/* Support items at bottom */}
        <div className="flex flex-col items-center pb-8">
          <ul className="space-y-2">
            {supportItems.map(renderMenuItem)}
          </ul>
        </div>
      </div>
      
      {/* Animated expandable sidebar */}
      <div 
        className={`bg-gray-900 text-white min-h-screen transition-all duration-150 ease-out overflow-hidden ${
          expanded ? 'w-64' : 'w-0'
        }`}
      >
        {expanded && (
          <div className="w-64 h-full">
            {renderFullSidebar(expanded)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
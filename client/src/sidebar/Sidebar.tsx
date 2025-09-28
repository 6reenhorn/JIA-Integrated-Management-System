import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, Wallet, Settings, Info, Menu } from 'lucide-react';

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
  currentSection?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick, onToggle, isCollapsed, currentSection }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Initialize expanded state based on activeItem
  useEffect(() => {
    if (activeItem && !expanded) {
      // Determine which main item should be expanded based on activeItem
      if (activeItem.startsWith('inventory')) {
        setExpanded('inventory');
      } else if (activeItem.startsWith('employees')) {
        setExpanded('employees');
      } else if (activeItem.startsWith('e-wallet')) {
        setExpanded('e-wallet');
      } else if (activeItem.startsWith('dashboard')) {
        setExpanded('dashboard');
      } else if (activeItem.startsWith('settings')) {
        setExpanded('settings');
      } else if (activeItem.startsWith('about')) {
        setExpanded('about');
      } else {
        setExpanded(activeItem);
      }
    }
  }, [activeItem, expanded]);

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

  // Updated sections for inventory - removed the duplicate "Inventory" section
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
          { id: 'inventory-categories', label: 'Sales' },
          { id: 'inventory-stock-levels', label: 'Category' }
        ];
      case 'employees':
        return [
          { id: 'employees-attendance', label: 'Attendance' }
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

  // Checker functions
  const isEWalletSection = (sectionId: string) => {
    return sectionId.startsWith('e-wallet-');
  };

  const isEmployeeSection = (sectionId: string) => {
    return sectionId.startsWith('employees-');
  };

  const isInventorySection = (sectionId: string) => {
    return sectionId.startsWith('inventory-');
  };

  // Function to check if a section is actually implemented/functional
  const isSectionFunctional = (sectionId: string) => {
    // E-Wallet sections are functional
    if (isEWalletSection(sectionId)) return true;
    
    // Employee sections are functional
    if (isEmployeeSection(sectionId)) return true;
    
    // Inventory sections are functional
    if (isInventorySection(sectionId)) return true;
    
    // Dashboard main section is functional
    if (sectionId === 'dashboard') return true;
    
    // Settings and About main sections are functional
    if (sectionId === 'settings' || sectionId === 'about') return true;
    
    // All other sections are not implemented yet
    return false;
  };

  // Enhanced function to check if item is active (including sub-sections and current section)
  const isItemActive = (itemId: string) => {
    // Handle main inventory page - if we're on inventory and current section is 'inventory' or undefined, 
    // the main inventory button should be active
    if (itemId === 'inventory' && activeItem === 'inventory' && (!currentSection || currentSection === 'inventory')) {
      return true;
    }
    
    // If we're in inventory and have a current section, map it to sidebar IDs
    if (activeItem === 'inventory' && currentSection) {
      const sectionMapping: Record<string, string> = {
        'sales': 'inventory-categories',
        'category': 'inventory-stock-levels'
      };
      
      const mappedSectionId = sectionMapping[currentSection];
      if (mappedSectionId && itemId === mappedSectionId) {
        return true;
      }
    }
    
    return activeItem === itemId || activeItem.startsWith(itemId + '-');
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = isItemActive(item.id);
    // Always show tooltip when hovered, regardless of active state
    const showTooltip = hoveredItem === item.id;

    return (
      <li key={item.id} className="relative">
        <button
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => {
            // Prevent re-clicking when already on the main item and expanded
            if (isActive && expanded === item.id) {
              return; // Do nothing if already active and expanded
            }
            
            // Toggle expansion or set to current item
            if (expanded === item.id && !isActive) {
              setExpanded(null);
            } else {
              setExpanded(item.id);
              onItemClick(item.id);
            }
          }}
          className={`w-full flex items-center justify-center gap-3 py-3 px-2 text-left rounded-lg transition-all duration-200 hover:bg-[#FFFFFF33] ${
            isActive ? 'bg-[#FFFFFF33] text-white' : 'text-gray-300'
          }`}
        >
          <span className="flex-shrink-0">{item.icon}</span>
        </button>
        
        {/* Tooltip - now shows even when active */}
        {showTooltip && (
          <div className="absolute left-12 top-1/2 transform -translate-y-1/2 ml-2 z-50">
            <div className="bg-[#016CA5] text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg border border-[#02367B]">
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
    
    if (!item) return null;
    
    return (
      <div className="bg-[#012F6C] text-white h-full flex flex-col shadow-lg overflow-hidden">
        <div>
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[#E2E8F0] flex-shrink-0 w-full">
            <div className="w-8 h-8 bg-[#016CA5] rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors duration-200 cursor-pointer">
              <span className="text-sm font-bold">L</span>
            </div>
            <span className="font-bold text-lg whitespace-nowrap">JIA <span className="text-sm">Integrated System</span></span>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Show the selected item */}
          <div className="mb-6">
            <button
              onClick={() => {
                // For inventory, clicking the main button should go to inventory section
                if (itemId === 'inventory') {
                  // Don't allow re-clicking if already on main inventory section
                  if (activeItem === 'inventory' && currentSection === 'inventory') {
                    return;
                  }
                  onItemClick('inventory');
                } else {
                  onItemClick(itemId);
                }
                setExpanded(itemId);
              }}
              className={`w-full flex items-center gap-3 py-3 px-3 text-left rounded-lg transition-all duration-200 ${
                (activeItem === itemId && (itemId !== 'inventory' || !currentSection || currentSection === 'inventory')) ? 'bg-[#FFFFFF33] text-white' : 'text-gray-300 hover:bg-[#FFFFFF33]'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="font-medium whitespace-nowrap">{item.label}</span>
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
                        // For functional sections, handle them properly
                        if (isSectionFunctional(section.id)) {
                          // Prevent re-clicking if already active
                          if (isItemActive(section.id)) {
                            return;
                          }
                          onItemClick(section.id);
                          setExpanded(itemId); // Keep the parent expanded
                        }
                      }}
                      className={`w-full flex items-center gap-3 py-2 px-4 text-left rounded-lg transition-all duration-200 text-sm ${
                        isItemActive(section.id) ? 'bg-[#FFFFFF33] text-white' : 'text-gray-300'
                      } ${isSectionFunctional(section.id) ? 'hover:bg-[#FFFFFF33] cursor-pointer' : 'cursor-default opacity-60'}`}
                    >
                      <span className="whitespace-nowrap">+ {section.label}</span>
                      {!isSectionFunctional(section.id) && (
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

  // Check if sidebar should show as expanded (when there's an expanded item and not collapsed)
  const shouldShowExpanded = expanded && !isCollapsed;

  return (
    <div className="relative flex h-screen">
      {/* Collapsed sidebar with icons only */}
      <div className="bg-[#02367B] text-white w-16 min-h-screen flex flex-col py-4 space-y-2 flex-shrink-0 border-r border-[#E2E8F0]">
        <div 
          className="w-8 h-8 flex items-center justify-center mb-4 rounded-lg transition-colors duration-200 mx-auto cursor-pointer" 
          onClick={() => {
            onToggle(); // Toggle the collapsed state
            if (isCollapsed) {
              // If we're currently collapsed and opening, set expanded state
              if (activeItem.startsWith('inventory')) {
                setExpanded('inventory');
              } else if (activeItem.startsWith('employees')) {
                setExpanded('employees');
              } else if (activeItem.startsWith('e-wallet')) {
                setExpanded('e-wallet');
              } else {
                setExpanded(activeItem || 'dashboard');
              }
            } else {
              // If we're closing, clear expanded state
              setExpanded(null);
            }
          }}
        >
          {shouldShowExpanded ? (
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
              <path d="M0 0 C91.74 0 183.48 0 278 0 C278 14.19 278 28.38 278 43 C186.26 43 94.52 43 0 43 C0 28.81 0 14.62 0 0 Z" fill="currentColor" transform="translate(64,341)"/>
              <path d="M0 0 C91.74 0 183.48 0 278 0 C278 14.19 278 28.38 278 43 C186.26 43 94.52 43 0 43 C0 28.81 0 14.62 0 0 Z" fill="currentColor" transform="translate(64,128)"/>
              <path d="M0 0 C4.175 1.92 7.099 4.758 10.332 7.961 10.928 8.548 11.524 9.135 12.138 9.74 13.392 10.98 14.644 12.222 15.892 13.467 17.811 15.374 19.748 17.261 21.686 19.148 22.902 20.356 24.118 21.564 25.332 22.773 25.915 23.337 26.498 23.901 27.099 24.482 28.698 26.099 28.698 26.099 31 29 30.707 32.301 29.41 33.963 27.108 36.252 26.185 37.182 26.185 37.182 25.243 38.13 24.564 38.799 23.885 39.467 23.185 40.155 22.473 40.868 21.761 41.58 21.027 42.315 18.67 44.67 16.302 47.015 13.934 49.36 12.298 50.99 10.662 52.621 9.028 54.252 4.722 58.546 0.408 62.831 -3.909 67.115 -8.311 71.486 -12.705 75.867 -17.1 80.246 -25.725 88.839 -34.359 97.423 -43 106 -41.687 108.905 -40.288 110.955 -38.019 113.188 -37.409 113.793 -36.799 114.399 -36.171 115.022 -35.503 115.675 -34.836 116.328 -34.148 117 -33.091 118.045 -33.091 118.045 -32.014 119.11 -30.486 120.621 -28.956 122.129 -27.424 123.635 -25.003 126.016 -22.589 128.405 -20.178 130.797 -13.322 137.595 -6.457 144.383 0.424 151.156 4.632 155.3 8.827 159.456 13.016 163.619 14.617 165.206 16.222 166.788 17.833 168.365 20.079 170.566 22.309 172.781 24.536 175 25.546 175.979 25.546 175.979 26.577 176.978 27.179 177.583 27.781 178.189 28.4 178.813 29.194 179.596 29.194 179.596 30.004 180.395 31 182 31 182 30.736 184.103 29.897 186.265 28.964 187.399 27.316 189.024 26.756 189.585 26.195 190.145 25.618 190.722 25.01 191.314 24.403 191.906 23.777 192.516 23.157 193.131 22.537 193.747 21.898 194.382 19.918 196.345 17.928 198.298 15.938 200.25 14.592 201.58 13.248 202.911 11.904 204.242 8.611 207.503 5.308 210.754 2 214 -1.498 212.501 -3.752 210.495 -6.429 207.811 -7.75 206.495 -7.75 206.495 -9.098 205.151 -10.066 204.176 -11.033 203.201 -12 202.226 -13.026 201.201 -14.051 200.176 -15.077 199.151 -17.858 196.371 -20.632 193.584 -23.406 190.797 -26.307 187.884 -29.213 184.976 -32.119 182.068 -37.619 176.561 -43.114 171.05 -48.608 165.536 -54.863 159.259 -61.123 152.988 -67.384 146.717 -80.262 133.817 -93.134 120.911 -106 108 -104.501 104.502 -102.495 102.248 -99.811 99.571 -98.495 98.25 -98.495 98.25 -97.151 96.902 -96.176 95.934 -95.201 94.967 -94.226 93.999 -93.201 92.974 -92.176 91.949 -91.151 90.923 -88.371 88.142 -85.584 85.368 -82.797 82.594 -79.884 79.693 -76.976 76.787 -74.068 73.881 -68.561 68.381 -63.05 62.886 -57.536 57.392 -51.259 51.137 -44.988 44.877 -38.717 38.616 -25.817 25.738 -12.911 12.866 0 0 Z" fill="currentColor" transform="translate(417,149)"/>
            <path d="M0 0 C70.62 0 141.24 0 214 0 C214 14.52 214 29.04 214 44 C143.38 44 72.76 44 0 44 C0 29.48 0 14.96 0 0 Z" fill="currentColor" transform="translate(64,234)"/>
          </svg>

          ) : (
            <Menu size={24} className="text-white" />
          )}
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
        className={`bg-[#012F6C] text-white min-h-screen transition-all duration-150 ease-out overflow-hidden ${
          shouldShowExpanded ? 'w-64' : 'w-0'
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
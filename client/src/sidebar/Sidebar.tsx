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
          className={`w-full flex items-center justify-center gap-3 py-3 px-2 text-left rounded-lg transition-all duration-200 hover:bg-gray-600 ${
            isActive ? 'bg-gray-600 text-white' : 'text-gray-300'
          }`}
        >
          <span className="flex-shrink-0">{item.icon}</span>
        </button>
        
        {/* Tooltip - now shows even when active */}
        {showTooltip && (
          <div className="absolute left-12 top-1/2 transform -translate-y-1/2 ml-2 z-50">
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
    
    if (!item) return null;
    
    return (
      <div className="bg-gray-900 text-white h-full flex flex-col shadow-lg overflow-hidden">
        <div className='flex pl-1'>
          <div className="flex justify-start items-center gap-2 p-4 border-b border-gray-700 flex-shrink-0">
            <div 
              className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors duration-200 mx-auto cursor-pointer" 
              onClick={() => {
                setExpanded(null);
                onToggle(); // Call onToggle to collapse the sidebar
              }}
            >
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
                (activeItem === itemId && (itemId !== 'inventory' || !currentSection || currentSection === 'inventory')) ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
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
                        isItemActive(section.id) ? 'bg-gray-700 text-white' : 'text-gray-300'
                      } ${isSectionFunctional(section.id) ? 'hover:bg-gray-700 cursor-pointer' : 'cursor-default opacity-60'}`}
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
      <div className="bg-gray-800 text-white w-16 min-h-screen flex flex-col py-4 space-y-2 flex-shrink-0">
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
              <path d="M0 0 C91.74 0 183.48 0 278 0 C278 14.19 278 28.38 278 43 C186.26 43 94.52 43 0 43 C0 28.81 0 14.62 0 0 Z " fill="currentColor" transform="translate(64,341)"/>
              <path d="M0 0 C91.74 0 183.48 0 278 0 C278 14.19 278 28.38 278 43 C186.26 43 94.52 43 0 43 C0 28.81 0 14.62 0 0 Z " fill="currentColor" transform="translate(64,128)"/>
              <path d="M0 0 C4.17513552 1.91973078 7.09918108 4.75833911 10.33203125 7.9609375 C10.92803635 8.54791412 11.52404144 9.13489075 12.1381073 9.73965454 C13.3922274 10.97929844 14.64358151 12.22174608 15.89233398 13.46679688 C17.81110678 15.37361546 19.7477424 17.26098794 21.68554688 19.1484375 C22.90218592 20.3556187 24.11772004 21.56391474 25.33203125 22.7734375 C25.91523636 23.33711029 26.49844147 23.90078308 27.09931946 24.48153687 C28.69848633 26.09912109 28.69848633 26.09912109 31 29 C30.70725187 32.30084411 29.40992627 33.96268055 27.10838318 36.25238037 C26.18497131 37.18197823 26.18497131 37.18197823 25.24290466 38.13035583 C24.56389603 38.79857864 23.88488739 39.46680145 23.18530273 40.15527344 C22.47314606 40.86786819 21.76098938 41.58046295 21.0272522 42.31465149 C18.66974005 44.67007234 16.30177685 47.01468718 13.93359375 49.359375 C12.29769242 50.98968162 10.66245185 52.6206515 9.02784729 54.2522583 C4.72225516 58.54639194 0.40773006 62.83144078 -3.90869141 67.11468506 C-8.31107489 71.48638956 -12.70498605 75.86659092 -17.09960938 80.24609375 C-25.72478317 88.83908564 -34.35941407 97.42250771 -43 106 C-41.68717857 108.90533925 -40.28757977 110.95493857 -38.0193634 113.1875 C-37.40934982 113.79303711 -36.79933624 114.39857422 -36.1708374 115.02246094 C-35.50320374 115.67504883 -34.83557007 116.32763672 -34.14770508 117 C-33.09147194 118.04462402 -33.09147194 118.04462402 -32.01390076 119.11035156 C-30.48599063 120.62061781 -28.95589047 122.12867093 -27.42386818 123.63476562 C-25.0028718 126.01638851 -22.58943341 128.4054247 -20.17814636 130.796875 C-13.32215995 137.59476017 -6.45660513 144.38285871 0.42358398 151.15625 C4.63153891 155.29993689 8.8273585 159.45558373 13.0156498 163.61914062 C14.616695 165.20588392 16.22240745 166.78793175 17.83275414 168.36523438 C20.07858356 170.56559711 22.30873616 172.78075822 24.53588867 175 C25.54644821 175.97888184 25.54644821 175.97888184 26.5774231 176.97753906 C27.1789772 177.58307617 27.78053131 178.18861328 28.40031433 178.8125 C29.1942297 179.59560547 29.1942297 179.59560547 30.00418377 180.39453125 C31 182 31 182 30.73643303 184.10271835 C29.8969878 186.26539163 28.96351859 187.39921932 27.31616211 189.02441406 C26.75565659 189.58469299 26.19515106 190.14497192 25.61766052 190.722229 C25.01035599 191.31404968 24.40305145 191.90587036 23.77734375 192.515625 C23.15726944 193.13145447 22.53719513 193.74728394 21.89833069 194.3817749 C19.91832095 196.34500635 17.92813081 198.29754436 15.9375 200.25 C14.59241465 201.58003748 13.24800512 202.91075879 11.90429688 204.2421875 C8.61065094 207.50277537 5.30783661 210.75381188 2 214 C-1.49801422 212.50145783 -3.75157144 210.49540544 -6.42926025 207.81124878 C-7.75011627 206.49451675 -7.75011627 206.49451675 -9.09765625 205.15118408 C-10.06552278 204.17623987 -11.033293 203.20120004 -12.00097656 202.22607422 C-13.02575442 201.20073209 -14.05097312 200.17583042 -15.07659912 199.15133667 C-17.85762918 196.37088049 -20.63244911 193.58430044 -23.40620136 190.79658651 C-26.30675356 187.88353292 -29.21296944 184.97614104 -32.11859131 182.06814575 C-37.61903401 176.56148656 -43.11435852 171.0497489 -48.60786605 165.53617203 C-54.86265855 159.25902584 -61.12313014 152.98755684 -67.38408709 146.71656013 C-80.26239093 133.81735044 -93.13353955 120.9110225 -106 108 C-104.50145783 104.50198578 -102.49540544 102.24842856 -99.81124878 99.57073975 C-98.49451675 98.24988373 -98.49451675 98.24988373 -97.15118408 96.90234375 C-96.17623987 95.93447722 -95.20120004 94.966707 -94.22607422 93.99902344 C-93.20073209 92.97424558 -92.17583042 91.94902688 -91.15133667 90.92340088 C-88.37088049 88.14237082 -85.58430044 85.36755089 -82.79658651 82.59379864 C-79.88353292 79.69324644 -76.97614104 76.78703056 -74.06814575 73.88140869 C-68.56148656 68.38096599 -63.0497489 62.88564148 -57.53617203 57.39213395 C-51.25902584 51.13734145 -44.98755684 44.87686986 -38.71656013 38.61591291 C-25.81735044 25.73760907 -12.9110225 12.86646045 0 0 Z " fill="currentColor" transform="translate(417,149)"/>
              <path d="M0 0 C70.62 0 141.24 0 214 0 C214 14.52 214 29.04 214 44 C143.38 44 72.76 44 0 44 C0 29.48 0 14.96 0 0 Z " fill="currentColor" transform="translate(64,234)"/>
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
        className={`bg-gray-900 text-white min-h-screen transition-all duration-150 ease-out overflow-hidden ${
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
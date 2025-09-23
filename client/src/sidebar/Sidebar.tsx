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

  const renderMenuItem = (item: MenuItem) => (
    <li key={item.id}>
      <button
        onClick={() => {
          setExpanded(expanded === item.id ? null : item.id);
          onItemClick(item.id); 
        }}
        className={`w-full flex items-center justify-center gap-3 py-3 text-left rounded-lg transition-all duration-200 hover:bg-gray-600 ${
          activeItem === item.id ? 'bg-gray-600 text-white' : 'text-gray-300'
        }`}
      >
        <span className="flex-shrink-0">{item.icon}</span>
      </button>
    </li>
  );

  // Full sidebar content
  const renderFullSidebar = (itemId: string) => {
    const item = [...mainMenuItems, ...supportItems].find(i => i.id === itemId);
    return (
      <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col shadow-lg z-20">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <span className="font-bold text-lg">{item?.label || 'Sidebar'}</span>
          <button onClick={() => setExpanded(null)}>
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Main Menu</p>
          <ul className="space-y-2">
            {mainMenuItems.map(menuItem => (
              <li key={menuItem.id}>
                <button
                  onClick={() => {
                    onItemClick(menuItem.id);
                    setExpanded(menuItem.id); 
                  }}
                  className={`w-full flex items-center gap-3 py-3 text-left rounded-lg transition-all duration-200 hover:bg-gray-700 ${
                    activeItem === menuItem.id ? 'bg-gray-700 text-white' : 'text-gray-300'
                  }`}
                >
                  <span className="flex-shrink-0">{menuItem.icon}</span>
                  <span className="font-medium">{menuItem.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Support</p>
            <ul className="space-y-2">
              {supportItems.map(menuItem => (
                <li key={menuItem.id}>
                  <button
                    onClick={() => {
                      onItemClick(menuItem.id);
                      setExpanded(menuItem.id); 
                    }}
                    className={`w-full flex items-center gap-3 py-3 text-left rounded-lg transition-all duration-200 hover:bg-gray-700 ${
                      activeItem === menuItem.id ? 'bg-gray-700 text-white' : 'text-gray-300'
                    }`}
                  >
                    <span className="flex-shrink-0">{menuItem.icon}</span>
                    <span className="font-medium">{menuItem.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex">
      {/* Collapsed sidebar with icons only */}
      <div className="bg-gray-800 text-white w-16 min-h-screen flex flex-col items-center py-4 space-y-2">
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mb-4" onClick={onToggle} style={{ cursor: 'pointer' }}>
          <span className="text-sm font-bold">L</span>
        </div>
        <ul className="space-y-2">
          {mainMenuItems.map(renderMenuItem)}
        </ul>
        <div className="mt-8">
          <ul className="space-y-2">
            {supportItems.map(renderMenuItem)}
          </ul>
        </div>
      </div>
      {/* Full sidebar appears when an icon is clicked */}
      {expanded && (
        <div className="h-full">
          {renderFullSidebar(expanded)}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
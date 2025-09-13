import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Wallet, 
  Settings, 
  Info,
  Menu
} from 'lucide-react';

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

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick, isCollapsed, onToggle }) => {
  const mainMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, category: 'Main Menu' },
    { id: 'inventory', label: 'Inventory', icon: <Package size={20} /> },
    { id: 'employees', label: 'Employees', icon: <Users size={20} /> },
    { id: 'e-wallet', label: 'E-Wallet', icon: <Wallet size={20} /> },
  ];

  const supportItems: MenuItem[] = [
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, category: 'Support?' },
    { id: 'about', label: 'About', icon: <Info size={20} /> },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <li key={item.id}>
      <button
        onClick={() => onItemClick(item.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all duration-200 hover:bg-gray-600 ${
          activeItem === item.id ? 'bg-gray-600 text-white' : 'text-gray-300'
        }`}
      >
        <span className="flex-shrink-0">{item.icon}</span>
        {!isCollapsed && <span className="font-medium">{item.label}</span>}
      </button>
    </li>
  );

  return (
    <div className={`bg-gray-800 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">L</span>
          </div>
          {!isCollapsed && <span className="font-bold text-lg">Logo</span>}
        </div>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Main Menu */}
      <div className="flex-1 p-4">
        {!isCollapsed && (
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Main Menu</p>
        )}
        <ul className="space-y-2">
          {mainMenuItems.map(renderMenuItem)}
        </ul>

        {/* Support Section */}
        <div className="mt-8">
          {!isCollapsed && (
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Support?</p>
          )}
          <ul className="space-y-2">
            {supportItems.map(renderMenuItem)}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
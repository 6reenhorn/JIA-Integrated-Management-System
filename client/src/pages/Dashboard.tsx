import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import Overview from '../components/dashboard/Overview';
import Inventory from './Inventory';
import Employees from './Employees';
import EWallet from '../components/e-wallet/EWallet';
import Settings from '../components/support/settings/Settings';
import About from '../components/support/about/About';
import Navbar from '../navbar/navbar';
import type { EWalletTab } from '../types/ewallet_types';

// Define the section information type
interface SectionInfo {
  page: string;
  section?: string;
}

const Dashboard: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<SectionInfo>({ 
    page: 'dashboard', 
    section: undefined 
  });

  const handleEWalletTabChange = (tab: EWalletTab) => {
    const tabToActiveItem: Record<EWalletTab, string> = {
      'Overview': 'e-wallet',
      'GCash': 'e-wallet-gcash',
      'PayMaya': 'e-wallet-paymaya',
      'JuanPay': 'e-wallet-juanpay'
    };
    setActiveItem(tabToActiveItem[tab]);
  };

  const handleEmployeeSectionChange = (section: string) => {
    const sectionToActiveItem: Record<string, string> = {
      'staff': 'employees',
      'attendance': 'employees-attendance'
    };
    setActiveItem(sectionToActiveItem[section] || 'employees');
    updateCurrentSection('employees', section);
  };

  // Function to handle sidebar item clicks
  const handleSidebarItemClick = (itemId: string) => {
    setActiveItem(itemId);
    
    // Map sidebar section IDs to Inventory component sections
    const sectionMapping: Record<string, string> = {
      'inventory-inventory': 'inventory',
      'inventory-categories': 'sales', // Note: your sidebar has "Sales" but ID is "inventory-categories"
      'inventory-stock-levels': 'category', // Note: your sidebar has "Category" but ID is "inventory-stock-levels"
      'employees-attendance': 'attendance'
    };

    // If it's a known section ID, set the current section
    if (sectionMapping[itemId]) {
      const page = itemId.startsWith('inventory-') ? 'inventory' : itemId.startsWith('employees-') ? 'employees' : itemId;
      setCurrentSection({ page, section: sectionMapping[itemId] });
    } else if (itemId === 'inventory') {
      // If it's the main inventory item, default to inventory section
      setCurrentSection({ page: 'inventory', section: 'inventory' });
    } else if (itemId === 'employees') {
      // If it's the main employees item, default to staff section
      setCurrentSection({ page: 'employees', section: 'staff' });
    } else {
      // For other pages, reset the section
      setCurrentSection({ page: itemId, section: undefined });
    }
  };

  // Function to update the current section from child components
  const updateCurrentSection = (page: string, section?: string) => {
    setCurrentSection({ page, section });
  };

  const renderContent = (): React.ReactNode => {
    // Handle E-Wallet sections
    if (activeItem.startsWith('e-wallet')) {
      if (activeItem === 'e-wallet') {
        // Default E-Wallet shows Overview tab
        return (
          <EWallet key={activeItem} initialTab="Overview" onTabChange={handleEWalletTabChange} />
        );
      }
      const section = activeItem.replace('e-wallet-', '');
      // Map section IDs to E-Wallet tab names
      let initialTab: EWalletTab = 'Overview';
      switch (section) {
        case 'gcash':
          initialTab = 'GCash';
          break;
        case 'paymaya':
          initialTab = 'PayMaya';
          break;
        case 'juanpay':
          initialTab = 'JuanPay';
          break;
        default:
          initialTab = 'Overview';
      }
      return (
        <EWallet key={activeItem} initialTab={initialTab} onTabChange={handleEWalletTabChange} />
      );
    }

    // Handle Employees sections
    if (activeItem.startsWith('employees')) {
      const section = activeItem === 'employees-attendance' ? 'attendance' : 'staff';
      return <Employees
        activeSection={section}
        onSectionChange={handleEmployeeSectionChange}
      />;
    }

    // Handle main menu items
    switch (activeItem) {
      case 'dashboard':
        return <Overview />;
      case 'inventory':
        return <Inventory
          activeSection={currentSection.section || 'inventory'}
          onSectionChange={(section) => updateCurrentSection('inventory', section)}
        />;
      case 'e-wallet':
        return (
          <EWallet onTabChange={handleEWalletTabChange} />
        );
      case 'settings':
        return <Settings />;
      case 'about':
        return <About />;
      default:
        return <Overview />;
    }
  };

  const getPageTitle = (): string => {
    // If we're in inventory and have a specific section, use that
    if (currentSection.page === 'inventory' && currentSection.section) {
      switch (currentSection.section) {
        case 'inventory':
          return 'Inventory';
        case 'sales':
          return 'Sales';
        case 'category':
          return 'Category';
        default:
          return 'Inventory';
      }
    }

    // Handle E-Wallet sections
    if (activeItem.startsWith('e-wallet')) {
      if (activeItem === 'e-wallet') {
        return 'E-Wallet';
      }
      const section = activeItem.replace('e-wallet-', '');
      switch (section) {
        case 'gcash':
          return 'GCash';
        case 'paymaya':
          return 'PayMaya';
        case 'juanpay':
          return 'JuanPay';
        default:
          return 'E-Wallet';
      }
    }

    // Handle Employees sections
    if (activeItem.startsWith('employees')) {
      if (activeItem === 'employees-attendance') {
        return 'Attendance';
      }
      return 'Employees';
    }

    // Handle main menu items
    switch (activeItem) {
      case 'dashboard':
        return 'Overview';
      case 'inventory':
        return 'Inventory';
      case 'employees':
        return 'Employees';
      case 'e-wallet':
        return 'E-Wallet';
      case 'settings':
        return 'Settings';
      case 'about':
        return 'About';
      default:
        return 'Overview';
    }
  };

  const getHeaderSubtitle = (): string => {
    // If we're in inventory and have a specific section, use section-specific subtitles
    if (currentSection.page === 'inventory' && currentSection.section) {
      switch (currentSection.section) {
        case 'inventory':
          return 'Manage your products and stock levels';
        case 'sales':
          return 'Track your sales and transactions';
        case 'category':
          return 'Organize your product categories';
        default:
          return 'Manage your inventory system';
      }
    }

    // Handle E-Wallet sections
    if (activeItem.startsWith('e-wallet')) {
      if (activeItem === 'e-wallet') {
        return 'Complete overview of all your e-wallet accounts';
      }
      const section = activeItem.replace('e-wallet-', '');
      switch (section) {
        case 'gcash':
          return 'Manage your GCash transactions and balance';
        case 'paymaya':
          return 'Track your PayMaya payments and balance';
        case 'juanpay':
          return 'Monitor your JuanPay transactions and balance';
        default:
          return 'Track transactions and payments';
      }
    }

    // Handle Employees sections
    if (activeItem.startsWith('employees')) {
      if (activeItem === 'employees-attendance') {
        return 'Track employee attendance and schedules';
      }
      return 'Manage your team members and roles';
    }

    // Handle main menu items
    switch (activeItem) {
      case 'dashboard':
        return 'Monitor your inventory at a glance';
      case 'inventory':
        return 'Manage your products and stock levels';
      case 'employees':
        return 'Manage your team members and roles';
      case 'e-wallet':
        return 'Complete overview of all your e-wallet accounts';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar />
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar 
          activeItem={activeItem} 
          onItemClick={handleSidebarItemClick} 
          isCollapsed={isSidebarCollapsed} 
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
              <p className="text-gray-600">{getHeaderSubtitle()}</p>
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
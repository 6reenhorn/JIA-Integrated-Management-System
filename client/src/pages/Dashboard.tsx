import React, { useState, useEffect } from 'react';
import Sidebar from '../sidebar/Sidebar';
import Overview from '../components/dashboard/Overview';
import Inventory from './Inventory';
import Employees from './Employees';
import EWallet from './EWallet';
import Settings from '../components/support/settings/Settings';
import About from '../components/support/about/About';
import Navbar from '../navbar/navbar';
import CheckIn from '../components/support/CheckIn';

// Define the section information type
interface SectionInfo {
  page: string;
  section?: string;
}

const Dashboard: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);
  const [currentSection, setCurrentSection] = useState<SectionInfo>({ 
    page: 'dashboard', 
    section: undefined 
  });

  const [showCheckInModal, setShowCheckInModal] = useState<boolean>(false);

  // Sync sidebar with inventory sections
  useEffect(() => {
    // Sync sidebar with inventory sections
    if (currentSection.page === 'inventory' && currentSection.section) {
      const sectionToSidebarId: Record<string, string> = {
        'inventory': 'inventory',
        'sales': 'inventory-categories',
        'category': 'inventory-stock-levels'
      };

      const sidebarId = sectionToSidebarId[currentSection.section];
      if (sidebarId && activeItem !== sidebarId) {
        setActiveItem(sidebarId);
      }
    }
  }, [currentSection, activeItem]);

  const handleEWalletSectionChange = (section: string) => {
    const sectionToActiveItem: Record<string, string> = {
      'Overview': 'e-wallet',
      'GCash': 'e-wallet-gcash',
      'PayMaya': 'e-wallet-paymaya',
      'JuanPay': 'e-wallet-juanpay'
    };
    setActiveItem(sectionToActiveItem[section] || 'e-wallet');
    updateCurrentSection('e-wallet', section);
  };

  const handleEmployeeSectionChange = (section: string) => {
    const sectionToActiveItem: Record<string, string> = {
      'staff': 'employees',
      'attendance': 'employees-attendance',
      'payroll': 'employees-payroll'
    };
    setActiveItem(sectionToActiveItem[section] || 'employees');
    updateCurrentSection('employees', section);
  };

  // Function to handle sidebar item clicks
  const handleSidebarItemClick = (itemId: string) => {
    setActiveItem(itemId);
    
    // Enhanced section mapping
    const sectionMapping: Record<string, {page: string, section: string}> = {
      'inventory-categories': { page: 'inventory', section: 'sales' },
      'inventory-stock-levels': { page: 'inventory', section: 'category' },
      'employees-attendance': { page: 'employees', section: 'attendance' },
      'employees-payroll': { page: 'employees', section: 'payroll' },
      'e-wallet-gcash': { page: 'e-wallet', section: 'GCash' },
      'e-wallet-paymaya': { page: 'e-wallet', section: 'PayMaya' },
      'e-wallet-juanpay': { page: 'e-wallet', section: 'JuanPay' },
      'about-main': { page: 'about', section: 'main' },
      'about-version': { page: 'about', section: 'version' },
      'about-support': { page: 'about', section: 'support'},
      'about-license': { page: 'about', section: 'licenses' }
    };

    // If it's a known section ID, set the current section
    if (sectionMapping[itemId]) {
      setCurrentSection(sectionMapping[itemId]);
    } else if (itemId === 'inventory') {
      // If it's the main inventory item, default to inventory section
      setCurrentSection({ page: 'inventory', section: 'inventory' });
    } else if (itemId === 'employees') {
      // If it's the main employees item, default to staff section
      setCurrentSection({ page: 'employees', section: 'staff' });
    } else if (itemId === 'e-wallet') {
      // If it's the main e-wallet item, default to Overview section
      setCurrentSection({ page: 'e-wallet', section: 'Overview' });
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
      const section = activeItem === 'e-wallet' ? 'Overview' : activeItem.replace('e-wallet-', '');
      let mappedSection = section;
      switch (section) {
        case 'gcash':
          mappedSection = 'GCash';
          break;
        case 'paymaya':
          mappedSection = 'PayMaya';
          break;
        case 'juanpay':
          mappedSection = 'JuanPay';
          break;
        default:
          mappedSection = 'Overview';
      }
      return (
        <EWallet 
          activeSection={mappedSection} 
          onSectionChange={handleEWalletSectionChange} 
        />
      );
    }

    // Handle Employees sections
    if (activeItem.startsWith('employees')) {
      let section = 'staff';
      if (activeItem === 'employees-attendance') {
        section = 'attendance';
      } else if (activeItem === 'employees-payroll') {
        section = 'payroll';
      }
      return <Employees
        activeSection={section}
        onSectionChange={handleEmployeeSectionChange}
      />;
    }

    // Handle Inventory sections
    if (activeItem.startsWith('inventory') || activeItem === 'inventory') {
      return <Inventory
        activeSection={currentSection.section || 'inventory'}
        onSectionChange={(section) => updateCurrentSection('inventory', section)}
      />;
    }

    // Handle About sections
    if (activeItem.startsWith('about')) {
      let section = 'main';
      if (activeItem === 'about-version') {
        section = 'version';
      } else if (activeItem === 'about-support') {
        section = 'support';
      } else if (activeItem === 'about-license') {
        section = 'licenses';
      }
      return <About activeSection={section} />;
    }

    // Handle main menu items
    switch (activeItem) {
      case 'dashboard':
        return <Overview />;
      case 'settings':
        return <Settings />;
      case 'about':
        return <About activeSection="main" />;
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
      } else if (activeItem === 'employees-payroll') {
        return 'Payroll Records';
      }
      return 'Employees';
    }

    // Handle About sections
    if (activeItem.startsWith('about')) {
      if (activeItem === 'about') {
        return 'About';
      }
      const section = activeItem.replace('about-', '');
      switch (section) {
        case 'main':
          return 'About';
        case 'version':
          return 'Version Info';
        case 'support':
          return 'Support';
        case 'license':
          return 'License & Credits';
        default:
          return 'About';
      }
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
      } else if (activeItem === 'employees-payroll') {
        return 'Manage employee payroll records and payments';
      }
      return 'Manage your team members and roles';
    }

    // Handle About sections
    if (activeItem.startsWith('about')) {
      if (activeItem === 'about') {
        return 'Learn more about JIMS and its features';
      }
      const section = activeItem.replace('about-', '');
      switch (section) {
        case 'main':
          return 'Learn more about JIMS and its features';
        case 'version':
          return 'View version information and release notes';
        case 'support':
          return 'Get help and contact the development team';
        case 'license':
          return 'View licenses, credits, and acknowledgments';
        default:
          return 'Learn more about JIMS';
      }
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

  const handleCheckIn = () => {
    setShowCheckInModal(true);
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
          currentSection={currentSection.section}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="flex justify-between w-full mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
                <p className="text-gray-600">{getHeaderSubtitle()}</p>
              </div>
              {activeItem === 'dashboard' && (
                <div className='flex items-center'>
                  <button onClick={handleCheckIn} className='bg-[#02367B] border-2 border-[#1C4A9E] rounded-md px-4 py-2 text-white hover:bg-[#1C4A9E] focus:outline-none flex-shrink-0'>
                    Check In
                  </button>
                </div>
              )}
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
      {activeItem === 'dashboard' && showCheckInModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setShowCheckInModal(false)}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)'
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <CheckIn onClose={() => setShowCheckInModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import Overview from './Overview';
import Inventory from '../inventory/Inventory';
import Employees from '../../pages/Employees';
import EWallet from '../e-wallet/EWallet';
import Settings from '../support/settings/Settings';
import About from '../support/about/About';

const Dashboard: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const getCurrentDate = (): string => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const renderContent = (): React.ReactNode => {
    switch (activeItem) {
      case 'dashboard':
        return <Overview />;
      case 'inventory':
        return <Inventory />;
      case 'employees':
        return <Employees />;
      case 'e-wallet':
        return <EWallet />;
      case 'settings':
        return <Settings />;
      case 'about':
        return <About />;
      default:
        return <Overview />;
    }
  };

  const getPageTitle = (): string => {
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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeItem={activeItem}
        onItemClick={setActiveItem}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
            <p className="text-gray-600">Today, {getCurrentDate()}</p>
          </div>
          
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
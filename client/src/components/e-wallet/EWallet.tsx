import React, { useState, useEffect } from 'react';
import type { EWalletTab } from '../../types/ewallet_types';
import LayoutCard from '../layout/LayoutCard';

import Overview from './Overview';
import GCash from './Gcash';
import PayMaya from './PayMaya';
import JuanPay from './JuanPay';

interface EWalletProps {
  initialTab?: EWalletTab;
  onTabChange?: (tab: EWalletTab) => void;
}

const EWallet: React.FC<EWalletProps> = ({ initialTab = 'Overview', onTabChange }) => {
  const [activeTab, setActiveTab] = useState<EWalletTab>(initialTab);

  // Update activeTab when initialTab changes (useful for sidebar navigation)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const tabs: EWalletTab[] = ['Overview', 'GCash', 'PayMaya', 'JuanPay'];

  const handleTabChange = (tab: EWalletTab) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const renderContent = (): React.ReactNode => {
    switch (activeTab) {
      case 'Overview':
        return <Overview />;
      case 'GCash':
        return <GCash />;
      case 'PayMaya':
        return <PayMaya />;
      case 'JuanPay':
        return <JuanPay />;
      default:
        return <Overview />;
    }
  };

  return (
    <LayoutCard>
      <div className="mb-4">
        <div className="flex space-x-8 border-b border-gray-300">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Content */}
      {renderContent()}
    </LayoutCard>
  );
};

export default EWallet;
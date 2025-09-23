import { useState } from 'react';

import Overview from './Overview';
import GCash from './Gcash';
import PayMaya from './PayMaya';
import JuanPay from './JuanPay';

const EWallet = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'GCash', 'PayMaya', 'JuanPay'];

  const renderContent = () => {
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
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="flex space-x-8 border-b border-gray-300">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors hover:bg-gray-50 ${
                activeTab === tab
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Content */}
      {renderContent()}
    </div>
  );
};

export default EWallet;
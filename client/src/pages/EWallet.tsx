import React, { useState } from 'react';
import MainLayoutCard from '../components/layout/MainLayoutCard';

import Overview from '../components/e-wallet/Overview/Overview';
import GCash from '../components/e-wallet/Gcash/Gcash';
import PayMaya from '../components/e-wallet/Paymaya/PayMaya';
import JuanPay from '../components/e-wallet/JuanPay/JuanPay';

interface EWalletProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const EWallet: React.FC<EWalletProps> = ({ activeSection: propActiveSection, onSectionChange }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('Overview');

  const activeSection = propActiveSection ?? internalActiveSection;

  // Define sections similar to Employees component
  const sections = [
    { label: 'Overview', key: 'Overview' },
    { label: 'GCash', key: 'GCash' },
    { label: 'PayMaya', key: 'PayMaya' },
    { label: 'JuanPay', key: 'JuanPay' }
  ];

  const handleSectionChange = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    } else {
      setInternalActiveSection(section);
    }
  };

  return (
    <MainLayoutCard sections={sections} activeSection={activeSection} onSectionChange={handleSectionChange}>
      {/* Overview Section */}
      {activeSection === 'Overview' && (
        <div className="space-y-6">
          <Overview />
        </div>
      )}

      {/* GCash Section */}
      {activeSection === 'GCash' && (
        <div className="space-y-6">
          <GCash />
        </div>
      )}

      {/* PayMaya Section */}
      {activeSection === 'PayMaya' && (
        <div className="space-y-6">
          <PayMaya />
        </div>
      )}

      {/* JuanPay Section */}
      {activeSection === 'JuanPay' && (
        <div className="space-y-6">
          <JuanPay />
        </div>
      )}
    </MainLayoutCard>
  );
};

export default EWallet;
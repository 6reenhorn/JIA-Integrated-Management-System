import React, { useState } from 'react';
import MainLayoutCard from '../components/layout/MainLayoutCard';
import Portal from '../components/common/Portal';

import Overview from '../components/e-wallet/Overview/Overview';
import GCash from '../components/e-wallet/Gcash/Gcash';
import PayMaya from '../components/e-wallet/Paymaya/PayMaya';
import JuanPay from '../components/e-wallet/JuanPay/JuanPay';

import AddGCashRecordModal from '../modals/ewallet/GcashRecordModal';
import AddPayMayaRecordModal from '../modals/ewallet/PayMayaRecordModal';

import type { GCashRecord, PayMayaRecord } from '../types/ewallet_types';

interface EWalletProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const EWallet: React.FC<EWalletProps> = ({ activeSection: propActiveSection, onSectionChange }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('Overview');
  
  // Modal states
  const [isGCashModalOpen, setIsGCashModalOpen] = useState(false);
  const [isPayMayaModalOpen, setIsPayMayaModalOpen] = useState(false);
  
  // Records states
  const [gcashRecords, setGcashRecords] = useState<GCashRecord[]>([]);
  const [paymayaRecords, setPaymayaRecords] = useState<PayMayaRecord[]>([]);

  const activeSection = propActiveSection ?? internalActiveSection;

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

  // Handler for adding GCash record
  const handleAddGCashRecord = (newRecord: GCashRecord) => {
    setGcashRecords(prev => [...prev, newRecord]);
    console.log('New GCash record added:', newRecord);
  };

  // Handler for adding PayMaya record
  const handleAddPayMayaRecord = (newRecord: PayMayaRecord) => {
    setPaymayaRecords(prev => [...prev, newRecord]);
    console.log('New PayMaya record added:', newRecord);
  };

  return (
    <>
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
            <GCash 
              records={gcashRecords}
              onOpenModal={() => setIsGCashModalOpen(true)}
            />
          </div>
        )}

        {/* PayMaya Section */}
        {activeSection === 'PayMaya' && (
          <div className="space-y-6">
            <PayMaya 
              records={paymayaRecords}
              onOpenModal={() => setIsPayMayaModalOpen(true)}
            />
          </div>
        )}

        {/* JuanPay Section */}
        {activeSection === 'JuanPay' && (
          <div className="space-y-6">
            <JuanPay />
          </div>
        )}
      </MainLayoutCard>

      {/* GCash Modal */}
      {isGCashModalOpen && (
        <Portal>
          <div className='fixed inset-0 z-[1000] flex items-center justify-center'>
            <div
              className='absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm'
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            </div>
            <div className='relative z-[1010]'>
              <AddGCashRecordModal
                isOpen={isGCashModalOpen}
                onClose={() => setIsGCashModalOpen(false)}
                onAddRecord={handleAddGCashRecord}
              />
            </div>
          </div>
        </Portal>
      )}

      {/* PayMaya Modal */}
      {isPayMayaModalOpen && (
        <Portal>
          <div className='fixed inset-0 z-[1000] flex items-center justify-center'>
            <div
              className='absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm'
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            </div>
            <div className='relative z-[1010]'>
              <AddPayMayaRecordModal
                isOpen={isPayMayaModalOpen}
                onClose={() => setIsPayMayaModalOpen(false)}
                onAddRecord={handleAddPayMayaRecord}
              />
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

export default EWallet;
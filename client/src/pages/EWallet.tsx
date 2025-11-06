import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayoutCard from '../components/layout/MainLayoutCard';
import Portal from '../components/common/Portal';
import Overview from '../components/e-wallet/Overview/Overview';
import GCash from '../components/e-wallet/Gcash/Gcash';
import PayMaya from '../components/e-wallet/Paymaya/PayMaya';
import JuanPay from '../components/e-wallet/JuanPay/JuanPay';
import AddGCashRecordModal from '../modals/ewallet/GcashRecordModal';
import AddPayMayaRecordModal from '../modals/ewallet/PayMayaRecordModal';
import type { GCashRecord, PayMayaRecord } from '../types/ewallet_types';
import DeleteGCashRecordModal from '../modals/ewallet/DeleteGcashModal';
import DeletePayMayaRecordModal from '../modals/ewallet/DeletePayMayaModal';

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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isInitialLoadingPayMaya, setIsInitialLoadingPayMaya] = useState(true);

  // Action states for GCash deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<GCashRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action states for PayMaya deletion
  const [isDeletePayMayaModalOpen, setIsDeletePayMayaModalOpen] = useState(false);
  const [paymayaRecordToDelete, setPaymayaRecordToDelete] = useState<PayMayaRecord | null>(null);
  const [isDeletingPayMaya, setIsDeletingPayMaya] = useState(false);

  // Fetch GCash records on mount
  useEffect(() => {
    const fetchGcashRecords = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/gcash');
        setGcashRecords(response.data);
      } catch (err) {
        console.error('Error fetching GCash records:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchGcashRecords();
  }, []);

  // Fetch PayMaya records on mount
  useEffect(() => {
    const fetchPayMayaRecords = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/paymaya');
        setPaymayaRecords(response.data);
      } catch (err) {
        console.error('Error fetching PayMaya records:', err);
      } finally {
        setIsInitialLoadingPayMaya(false);
      }
    };
    fetchPayMayaRecords();
  }, []); 

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
  const handleAddGCashRecord = async (newRecord: Omit<GCashRecord, 'id'>) => {
    try {
      const response = await axios.post('http://localhost:3001/api/gcash', newRecord);
      
      // Add the new record and sort by date (newest first)
      setGcashRecords(prev => {
        const updated = [...prev, response.data];
        return updated.sort((a, b) => {
          // Sort by date descending (newest first)
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateB !== dateA) return dateB - dateA;
          
          // If dates are equal, sort by id descending
          return Number(b.id) - Number(a.id);
        });
      });
      
      setIsGCashModalOpen(false);
      console.log('GCash record added successfully');
    } catch (err) {
      console.error('Error adding GCash record:', err);
    }
  };

  const handleDeleteGCashRecord = async (id: string) => {
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:3001/api/gcash/${id}`);
      
      // Remove the deleted record from state
      setGcashRecords(prev => prev.filter(record => record.id !== id));
      
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
      console.log('GCash record deleted successfully');
    } catch (err) {
      console.error('Error deleting GCash record:', err);
      alert('Failed to delete record. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenDeleteModal = (record: GCashRecord) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  // Handler for adding PayMaya record 
  const handleAddPayMayaRecord = async (newRecord: Omit<PayMayaRecord, 'id'>) => {
    try {
      const response = await axios.post('http://localhost:3001/api/paymaya', newRecord);
      
      // Add the new record and sort by date (newest first)
      setPaymayaRecords(prev => {
        const updated = [...prev, response.data];
        return updated.sort((a, b) => {
          // Sort by date descending (newest first)
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateB !== dateA) return dateB - dateA;
          
          // If dates are equal, sort by id descending
          return Number(b.id) - Number(a.id);
        });
      });
      
      setIsPayMayaModalOpen(false);
      console.log('PayMaya record added successfully');
    } catch (err) {
      console.error('Error adding PayMaya record:', err);
    }
  };

  const handleDeletePayMayaRecord = async (id: string) => {
    setIsDeletingPayMaya(true);
    try {
      await axios.delete(`http://localhost:3001/api/paymaya/${id}`);
      
      // Remove the deleted record from state
      setPaymayaRecords(prev => prev.filter(record => record.id !== id));
      
      setIsDeletePayMayaModalOpen(false);
      setPaymayaRecordToDelete(null);
      console.log('PayMaya record deleted successfully');
    } catch (err) {
      console.error('Error deleting PayMaya record:', err);
      alert('Failed to delete record. Please try again.');
    } finally {
      setIsDeletingPayMaya(false);
    }
  };

  const handleOpenDeletePayMayaModal = (record: PayMayaRecord) => {
    setPaymayaRecordToDelete(record);
    setIsDeletePayMayaModalOpen(true);
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
              isLoading={isInitialLoading}
              onDelete={handleOpenDeleteModal}
            />
          </div>
        )}

        {/* PayMaya Section */}
        {activeSection === 'PayMaya' && (
          <div className="space-y-6">
            <PayMaya 
              records={paymayaRecords}
              onOpenModal={() => setIsPayMayaModalOpen(true)}
              isLoading={isInitialLoadingPayMaya}
              onDelete={handleOpenDeletePayMayaModal}
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

      {/* GCash Delete Modal */}
      {isDeleteModalOpen && (
        <Portal>
          <div className='fixed inset-0 z-[1000] flex items-center justify-center'>
            <DeleteGCashRecordModal
              isOpen={isDeleteModalOpen}
              onClose={() => {
                if (!isDeleting) {
                  setIsDeleteModalOpen(false);
                  setRecordToDelete(null);
                }
              }}
              onConfirmDelete={handleDeleteGCashRecord}
              record={recordToDelete}
              isDeleting={isDeleting}
            />
          </div>
        </Portal>
      )}

      {/* PayMaya Delete Modal */}
      {isDeletePayMayaModalOpen && (
        <Portal>
          <div className='fixed inset-0 z-[1000] flex items-center justify-center'>
            <DeletePayMayaRecordModal
              isOpen={isDeletePayMayaModalOpen}
              onClose={() => {
                if (!isDeletingPayMaya) {
                  setIsDeletePayMayaModalOpen(false);
                  setPaymayaRecordToDelete(null);
                }
              }}
              onConfirmDelete={handleDeletePayMayaRecord}
              record={paymayaRecordToDelete}
              isDeleting={isDeletingPayMaya}
            />
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
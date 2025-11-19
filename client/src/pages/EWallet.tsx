// client/src/pages/EWallet.tsx - UPDATED with JuanPay integration
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
import AddJuanPayRecordModal from '../modals/ewallet/JuanPayRecordModal';
import type { GCashRecord, PayMayaRecord, JuanPayRecord } from '../types/ewallet_types';
import DeleteGCashRecordModal from '../modals/ewallet/DeleteGcashModal';
import DeletePayMayaRecordModal from '../modals/ewallet/DeletePayMayaModal';
import DeleteJuanPayRecordModal from '../modals/ewallet/DeleteJuanPayModal';
import EditGCashRecordModal from '../modals/ewallet/EditGcashModal';
import EditPayMayaRecordModal from '../modals/ewallet/EditPayMayaModal';
import EditJuanPayRecordModal from '../modals/ewallet/EditJuanPayModal';

interface EWalletProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const EWallet: React.FC<EWalletProps> = ({ activeSection: propActiveSection, onSectionChange }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('Overview');
  
  // Modal states
  const [isGCashModalOpen, setIsGCashModalOpen] = useState(false);
  const [isPayMayaModalOpen, setIsPayMayaModalOpen] = useState(false);
  const [isJuanPayModalOpen, setIsJuanPayModalOpen] = useState(false);
  
  // Records states
  const [gcashRecords, setGcashRecords] = useState<GCashRecord[]>([]);
  const [paymayaRecords, setPaymayaRecords] = useState<PayMayaRecord[]>([]);
  const [juanpayRecords, setJuanpayRecords] = useState<JuanPayRecord[]>([]);
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isInitialLoadingPayMaya, setIsInitialLoadingPayMaya] = useState(true);
  const [isInitialLoadingJuanPay, setIsInitialLoadingJuanPay] = useState(true);

  // Animation states for GCash
  const [isAddingGCash, setIsAddingGCash] = useState(false);
  const [isDeletingGCash, setIsDeletingGCash] = useState(false);
  
  // Animation states for PayMaya
  const [isAddingPayMaya, setIsAddingPayMaya] = useState(false);
  const [isDeletingPayMayaRecord, setIsDeletingPayMayaRecord] = useState(false);

  // Animation states for JuanPay
  const [isAddingJuanPay, setIsAddingJuanPay] = useState(false);
  const [isDeletingJuanPay, setIsDeletingJuanPay] = useState(false);

  // Action states for GCash deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<GCashRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action states for GCash editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<GCashRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Action states for PayMaya deletion
  const [isDeletePayMayaModalOpen, setIsDeletePayMayaModalOpen] = useState(false);
  const [paymayaRecordToDelete, setPaymayaRecordToDelete] = useState<PayMayaRecord | null>(null);
  const [isDeletingPayMaya, setIsDeletingPayMaya] = useState(false);

  // Action states for PayMaya editing
  const [isEditPayMayaModalOpen, setIsEditPayMayaModalOpen] = useState(false);
  const [paymayaRecordToEdit, setPaymayaRecordToEdit] = useState<PayMayaRecord | null>(null);
  const [isEditingPayMaya, setIsEditingPayMaya] = useState(false);

  // Action states for JuanPay deletion
  const [isDeleteJuanPayModalOpen, setIsDeleteJuanPayModalOpen] = useState(false);
  const [juanpayRecordToDelete, setJuanpayRecordToDelete] = useState<JuanPayRecord | null>(null);
  const [isDeletingJuanPayState, setIsDeletingJuanPayState] = useState(false);

  // Action states for JuanPay editing
  const [isEditJuanPayModalOpen, setIsEditJuanPayModalOpen] = useState(false);
  const [juanpayRecordToEdit, setJuanpayRecordToEdit] = useState<JuanPayRecord | null>(null);
  const [isEditingJuanPay, setIsEditingJuanPay] = useState(false);

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

  // Fetch JuanPay records on mount
  useEffect(() => {
    const fetchJuanPayRecords = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/juanpay');
        setJuanpayRecords(response.data);
      } catch (err) {
        console.error('Error fetching JuanPay records:', err);
      } finally {
        setIsInitialLoadingJuanPay(false);
      }
    };
    fetchJuanPayRecords();
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
    setIsGCashModalOpen(false);
    setIsAddingGCash(true);
    try {
      const response = await axios.post('http://localhost:3001/api/gcash', newRecord);
      
      setGcashRecords(prev => {
        const updated = [...prev, response.data];
        return updated.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateB !== dateA) return dateB - dateA;
          return Number(b.id) - Number(a.id);
        });
      });
      
      setIsGCashModalOpen(false);
      console.log('GCash record added successfully');
    } catch (err) {
      console.error('Error adding GCash record:', err);
    } finally {
      setIsAddingGCash(false);
    }
  };

  const handleDeleteGCashRecord = async (id: string) => {
    setIsDeleting(true);
    setIsDeletingGCash(true);
    setIsDeleteModalOpen(false);
    setRecordToDelete(null);
    try {
      await axios.delete(`http://localhost:3001/api/gcash/${id}`);
      setGcashRecords(prev => prev.filter(record => record.id !== id));
      console.log('GCash record deleted successfully');
    } catch (err) {
      console.error('Error deleting GCash record:', err);
      alert('Failed to delete record. Please try again.');
    } finally {
      setIsDeleting(false);
      setIsDeletingGCash(false);
    }
  };

  const handleEditGCashRecord = async (id: string, updatedRecord: Omit<GCashRecord, 'id'>) => {
    setIsEditing(true);
    try {
      await axios.put(`http://localhost:3001/api/gcash/${id}`, updatedRecord);
      
      setGcashRecords(prev => {
        const updated = prev.map(record => 
          record.id === id ? { ...updatedRecord, id } : record
        );
        return updated.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateB !== dateA) return dateB - dateA;
          return Number(b.id) - Number(a.id);
        });
      });
      
      setIsEditModalOpen(false);
      setRecordToEdit(null);
      console.log('GCash record updated successfully');
    } catch (err) {
      console.error('Error updating GCash record:', err);
      alert('Failed to update record. Please try again.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleOpenEditModal = (record: GCashRecord) => {
    setRecordToEdit(record);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (record: GCashRecord) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  // Handler for adding PayMaya record 
  const handleAddPayMayaRecord = async (newRecord: Omit<PayMayaRecord, 'id'>) => {
    setIsPayMayaModalOpen(false);
    setIsAddingPayMaya(true);
    try {
      const response = await axios.post('http://localhost:3001/api/paymaya', newRecord);
      
      setPaymayaRecords(prev => {
        const updated = [...prev, response.data];
        return updated.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateB !== dateA) return dateB - dateA;
          return Number(b.id) - Number(a.id);
        });
      });
      
      setIsPayMayaModalOpen(false);
      console.log('PayMaya record added successfully');
    } catch (err) {
      console.error('Error adding PayMaya record:', err);
    } finally {
      setIsAddingPayMaya(false);
    }
  };

  const handleDeletePayMayaRecord = async (id: string) => {
    setIsDeletingPayMaya(true);
    setIsDeletingPayMayaRecord(true);
    setIsDeletePayMayaModalOpen(false);
    setPaymayaRecordToDelete(null);
    try {
      await axios.delete(`http://localhost:3001/api/paymaya/${id}`);
      setPaymayaRecords(prev => prev.filter(record => record.id !== id));
      console.log('PayMaya record deleted successfully');
    } catch (err) {
      console.error('Error deleting PayMaya record:', err);
      alert('Failed to delete record. Please try again.');
    } finally {
      setIsDeletingPayMaya(false);
      setIsDeletingPayMayaRecord(false);
    }
  };

  const handleOpenDeletePayMayaModal = (record: PayMayaRecord) => {
    setPaymayaRecordToDelete(record);
    setIsDeletePayMayaModalOpen(true);
  };

  const handleEditPayMayaRecord = async (id: string, updatedRecord: Omit<PayMayaRecord, 'id'>) => {
    setIsEditingPayMaya(true);
    try {
      await axios.put(`http://localhost:3001/api/paymaya/${id}`, updatedRecord);
      
      setPaymayaRecords(prev => {
        const updated = prev.map(record => 
          record.id === id ? { ...updatedRecord, id } : record
        );
        return updated.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateB !== dateA) return dateB - dateA;
          return Number(b.id) - Number(a.id);
        });
      });
      
      setIsEditPayMayaModalOpen(false);
      setPaymayaRecordToEdit(null);
      console.log('PayMaya record updated successfully');
    } catch (err) {
      console.error('Error updating PayMaya record:', err);
      alert('Failed to update record. Please try again.');
    } finally {
      setIsEditingPayMaya(false);
    }
  };

  const handleOpenEditPayMayaModal = (record: PayMayaRecord) => {
    setPaymayaRecordToEdit(record);
    setIsEditPayMayaModalOpen(true);
  };

  // Handler for adding JuanPay record 
  const handleAddJuanPayRecord = async (newRecord: Omit<JuanPayRecord, 'id'>) => {
    setIsJuanPayModalOpen(false);
    setIsAddingJuanPay(true);
    try {
      const response = await axios.post('http://localhost:3001/api/juanpay', newRecord);
      
      setJuanpayRecords(prev => {
        const updated = [...prev, response.data];
        return updated.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateB !== dateA) return dateB - dateA;
          return Number(b.id) - Number(a.id);
        });
      });
      
      console.log('JuanPay record added successfully');
    } catch (err) {
      console.error('Error adding JuanPay record:', err);
    } finally {
      setIsAddingJuanPay(false);
    }
  };

  const handleDeleteJuanPayRecord = async (id: string) => {
    setIsDeletingJuanPayState(true);
    setIsDeletingJuanPay(true);
    setIsDeleteJuanPayModalOpen(false);
    setJuanpayRecordToDelete(null);
    try {
      await axios.delete(`http://localhost:3001/api/juanpay/${id}`);
      setJuanpayRecords(prev => prev.filter(record => record.id !== id));
      console.log('JuanPay record deleted successfully');
    } catch (err) {
      console.error('Error deleting JuanPay record:', err);
      alert('Failed to delete record. Please try again.');
    } finally {
      setIsDeletingJuanPayState(false);
      setIsDeletingJuanPay(false);
    }
  };

  const handleEditJuanPayRecord = async (id: string, updatedRecord: Omit<JuanPayRecord, 'id'>) => {
    setIsEditingJuanPay(true);
    try {
      await axios.put(`http://localhost:3001/api/juanpay/${id}`, updatedRecord);
      
      setJuanpayRecords(prev => {
        const updated = prev.map(record => 
          record.id === id ? { ...updatedRecord, id } : record
        );
        return updated.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateB !== dateA) return dateB - dateA;
          return Number(b.id) - Number(a.id);
        });
      });
      
      setIsEditJuanPayModalOpen(false);
      setJuanpayRecordToEdit(null);
      console.log('JuanPay record updated successfully');
    } catch (err) {
      console.error('Error updating JuanPay record:', err);
      alert('Failed to update record. Please try again.');
    } finally {
      setIsEditingJuanPay(false);
    }
  };

  const handleOpenDeleteJuanPayModal = (record: JuanPayRecord) => {
    setJuanpayRecordToDelete(record);
    setIsDeleteJuanPayModalOpen(true);
  };

  const handleOpenEditJuanPayModal = (record: JuanPayRecord) => {
    setJuanpayRecordToEdit(record);
    setIsEditJuanPayModalOpen(true);
  };

  return (
    <>
      <MainLayoutCard sections={sections} activeSection={activeSection} onSectionChange={handleSectionChange}>
        {/* Overview Section */}
        {activeSection === 'Overview' && (
          <div className="space-y-6">
            <Overview gcashRecords={gcashRecords} paymayaRecords={paymayaRecords} />
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
              onEdit={handleOpenEditModal}
              isAdding={isAddingGCash}
              isDeleting={isDeletingGCash}
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
              onEdit={handleOpenEditPayMayaModal} 
              isAdding={isAddingPayMaya}
              isDeleting={isDeletingPayMayaRecord}
            />
          </div>
        )}

        {/* JuanPay Section */}
        {activeSection === 'JuanPay' && (
          <div className="space-y-6">
            <JuanPay 
              records={juanpayRecords}
              onOpenModal={() => setIsJuanPayModalOpen(true)}
              isLoading={isInitialLoadingJuanPay}
              onDelete={handleOpenDeleteJuanPayModal}
              onEdit={handleOpenEditJuanPayModal}
              isAdding={isAddingJuanPay}
              isDeleting={isDeletingJuanPay}
            />
          </div>
        )}
      </MainLayoutCard>

      {/* GCash Modal */}
      {isGCashModalOpen && (
        <Portal>
          <div className='fixed inset-0 z-[1000] flex items-center justify-center'>
            <div className='absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm' style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}></div>
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

      {/* GCash Edit Modal */}
      {isEditModalOpen && (
        <Portal>
          <div className='fixed inset-0 z-[1000] flex items-center justify-center'>
            <EditGCashRecordModal
              isOpen={isEditModalOpen}
              onClose={() => {
                if (!isEditing) {
                  setIsEditModalOpen(false);
                  setRecordToEdit(null);
                }
              }}
              onEditRecord={handleEditGCashRecord}
              record={recordToEdit}
              isEditing={isEditing}
            />
          </div>
        </Portal>
      )}

      {/* PayMaya Modal */}
      {isPayMayaModalOpen && (
        <Portal>
          <div className='fixed inset-0 z-[1000] flex items-center justify-center'>
            <div className='absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm' style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}></div>
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

      {/* PayMaya Edit Modal */}
      {isEditPayMayaModalOpen && (
        <Portal>
          <div className='fixed inset-0 z-[1000] flex items-center justify-center'>
            <EditPayMayaRecordModal
              isOpen={isEditPayMayaModalOpen}
              onClose={() => {
                if (!isEditingPayMaya) {
                  setIsEditPayMayaModalOpen(false);
                  setPaymayaRecordToEdit(null);
                }
              }}
              onEditRecord={handleEditPayMayaRecord}
              record={paymayaRecordToEdit}
              isEditing={isEditingPayMaya}
            />
          </div>
        </Portal>
      )}

      {/* JuanPay Modal */}
      {isJuanPayModalOpen && (
        <Portal>
          <div className='fixed inset-0 z-[1000] flex items-center justify-center'>
            <div className='absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm' style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}></div>
            <div className='relative z-[1010]'>
              <AddJuanPayRecordModal
                isOpen={isJuanPayModalOpen}
                onClose={() => setIsJuanPayModalOpen(false)}
                onAddRecord={handleAddJuanPayRecord}
              />
            </div>
          </div>
        </Portal>
      )}

      {/* JuanPay Delete Modal */}
      {isDeleteJuanPayModalOpen && (
        <Portal>
          <div className='fixed inset-0 z-[1000] flex items-center justify-center'>
            <DeleteJuanPayRecordModal
              isOpen={isDeleteJuanPayModalOpen}
              onClose={() => {
                if (!isDeletingJuanPayState) {
                  setIsDeleteJuanPayModalOpen(false);
                  setJuanpayRecordToDelete(null);
                }
              }}
              onConfirmDelete={handleDeleteJuanPayRecord}
              record={juanpayRecordToDelete}
              isDeleting={isDeletingJuanPayState}
            />
          </div>
        </Portal>
      )}

      {/* JuanPay Edit Modal */}
      {isEditJuanPayModalOpen && (
        <Portal>
          <div className='fixed inset-0 z-[1000] flex items-center justify-center'>
            <EditJuanPayRecordModal
              isOpen={isEditJuanPayModalOpen}
              onClose={() => {
                if (!isEditingJuanPay) {
                  setIsEditJuanPayModalOpen(false);
                  setJuanpayRecordToEdit(null);
                }
              }}
              onEditRecord={handleEditJuanPayRecord}
              record={juanpayRecordToEdit}
              isEditing={isEditingJuanPay}
            />
          </div>
        </Portal>
      )}
    </>
  );
};

export default EWallet;
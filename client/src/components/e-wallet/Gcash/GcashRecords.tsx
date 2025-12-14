import React from 'react';
import type { GCashRecord } from '../../../types/ewallet_types';
import GCashTable from './GcashTable';

interface GCashRecordsTableProps {
  records: GCashRecord[];
  isLoading: boolean;
  onEdit?: (record: GCashRecord) => void;
  onDelete?: (record: GCashRecord) => void;
  isAdding?: boolean;
  isDeleting?: boolean;
}

const GCashRecordsTable: React.FC<GCashRecordsTableProps> = ({
  records,
  isLoading,
  onEdit,
  onDelete,
  isAdding = false,
  isDeleting = false,
}) => {
  return (
    <GCashTable
      records={records}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      isAdding={isAdding}
      isDeleting={isDeleting}
    />
  );
};

export default GCashRecordsTable;
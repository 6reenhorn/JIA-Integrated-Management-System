import React from 'react';
import type { PayMayaRecord } from '../../../types/ewallet_types';
import PayMayaTable from './PayMayaTable';

interface PayMayaRecordsTableProps {
  records: PayMayaRecord[];
  isLoading?: boolean;
  onEdit?: (record: PayMayaRecord) => void;
  onDelete?: (record: PayMayaRecord) => void;
  isAdding?: boolean;
  isDeleting?: boolean;
}

const PayMayaRecordsTable: React.FC<PayMayaRecordsTableProps> = ({
  records,
  isLoading = false,
  onEdit,
  onDelete,
  isAdding = false,
  isDeleting = false,
}) => {
  return (
    <PayMayaTable
      records={records}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      isAdding={isAdding}
      isDeleting={isDeleting}
    />
  );
};

export default PayMayaRecordsTable;
import React from 'react';
import type { JuanPayRecord } from '../../../types/ewallet_types';
import JuanPayTable from './juanPayTables';

interface JuanPayRecordsTableProps {
  records: JuanPayRecord[];
  isLoading: boolean;
  onEdit?: (record: JuanPayRecord) => void;
  onDelete?: (record: JuanPayRecord) => void;
  isAdding?: boolean;
  isDeleting?: boolean;
}

const JuanPayRecordsTable: React.FC<JuanPayRecordsTableProps> = ({
  records,
  isLoading,
  onEdit,
  onDelete,
  isAdding = false,
  isDeleting = false,
}) => {
  return (
    <JuanPayTable
      records={records}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      isAdding={isAdding}
      isDeleting={isDeleting}
    />
  );
};

export default JuanPayRecordsTable;
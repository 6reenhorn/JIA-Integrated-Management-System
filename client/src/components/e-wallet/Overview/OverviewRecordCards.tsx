import React from 'react';
import LayoutCard from '../../layout/LayoutCard';

interface RecordCardProps {
  title: string;
  count: string;
}

const RecordCard: React.FC<RecordCardProps> = ({ title, count }) => (
  <LayoutCard className="text-center min-h-[120px]">
    <h3 className="text-gray-500 font-medium mb-2">{title}</h3>
    <div className="text-4xl font-bold text-gray-900">
      {count}
    </div>
  </LayoutCard>
);

interface OverviewRecordCardsProps {
  totalRecords: number;
  gcashRecords: number;
  paymayaRecords: number;
  juanpayRecords: number;
}

const OverviewRecordCards: React.FC<OverviewRecordCardsProps> = ({
  totalRecords,
  gcashRecords,
  paymayaRecords,
  juanpayRecords
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <RecordCard 
        title="Total Records" 
        count={String(totalRecords)} 
      />
      <RecordCard 
        title="GCash Records" 
        count={String(gcashRecords)} 
      />
      <RecordCard 
        title="PayMaya Records" 
        count={String(paymayaRecords)} 
      />
      <RecordCard 
        title="JuanPay Records" 
        count={String(juanpayRecords)} 
      />
    </div>
  );
};

export default OverviewRecordCards;
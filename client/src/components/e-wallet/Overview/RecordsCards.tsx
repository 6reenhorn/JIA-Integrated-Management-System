import React from 'react';
import LayoutCard from '../../layout/LayoutCard';
import type { RecordCardProps } from '../../../types/ewallet_types';

interface RecordsCardsProps {
  gcashRecordsCount: number;
  paymayaRecordsCount: number;
  juanpayRecordsCount: number;
  isLoading?: boolean;
}

const RecordsCards: React.FC<RecordsCardsProps> = ({ 
  gcashRecordsCount, 
  paymayaRecordsCount, 
  juanpayRecordsCount,
  isLoading = false 
}) => {
  const RecordCard: React.FC<RecordCardProps> = ({ title, count }) => (
    <LayoutCard className="text-center min-h-[120px]">
      <h3 className="text-gray-500 font-medium mb-2">{title}</h3>
      <div className="text-4xl font-bold text-gray-900">
        {count}
      </div>
    </LayoutCard>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <LayoutCard key={i} className="text-center min-h-[120px] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-16 mx-auto"></div>
          </LayoutCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <RecordCard
        title="Total Records"
        count={String(gcashRecordsCount + paymayaRecordsCount + juanpayRecordsCount)}
      />
      <RecordCard 
        title="GCash Records" 
        count={String(gcashRecordsCount)} 
      />
      <RecordCard 
        title="PayMaya Records" 
        count={String(paymayaRecordsCount)} 
      />
      <RecordCard
        title="JuanPay Records"
        count={String(juanpayRecordsCount)}
      />
    </div>
  );
};

export default RecordsCards;
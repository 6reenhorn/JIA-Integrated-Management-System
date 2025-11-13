import React from 'react';
import LayoutCard from '../../layout/LayoutCard';

interface SummaryData {
  label: string;
  value: string;
}

interface SummaryCardProps {
  title: string;
  data: SummaryData[];
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, data }) => (
  <LayoutCard title={title} className="min-h-[200px]">
    <div className="space-y-3">
      {data.map((item, index) => {
        const isHighlight = item.label === 'Total Charges';
        return (
          <div
            key={index}
            className={`flex justify-between items-center ${
              isHighlight ? 'pt-2 mt-2 border-t border-gray-200' : ''
            }`}
          >
            <span
              className={`text-sm ${
                isHighlight ? 'text-gray-900 font-bold' : 'text-gray-500'
              }`}
            >
              {item.label}
            </span>
            <span
              className={`${
                item.value.includes('-')
                  ? 'text-red-500 font-medium'
                  : 'text-gray-900 font-medium'
              }`}
            >
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  </LayoutCard>
);

interface OverviewSummaryCardsProps {
  gcashData: SummaryData[];
  paymayaData: SummaryData[];
  juanpayData: SummaryData[];
}

const OverviewSummaryCards: React.FC<OverviewSummaryCardsProps> = ({
  gcashData,
  paymayaData,
  juanpayData
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SummaryCard title="GCash Daily" data={gcashData} />
      <SummaryCard title="PayMaya Daily" data={paymayaData} />
      <SummaryCard title="JuanPay Daily" data={juanpayData} />
    </div>
  );
};

export default OverviewSummaryCards;
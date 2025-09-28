import React from 'react';

export interface DLayoutCardProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

const LayoutCard: React.FC<DLayoutCardProps> = ({ title, children, className = "" }) => (
  <div className={`bg-gray-100 border-2 border-[#E5E7EB] rounded-[12px] p-6 shadow-sm min-h-[150px] ${className}`}>
    {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
    {children}
  </div>
);

export default LayoutCard;
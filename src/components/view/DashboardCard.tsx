import React from 'react';

export interface DashboardCardProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  children, 
  className = "" 
}) => (
  <div className={`bg-gray-200 rounded-lg p-6 min-h-[150px] ${className}`}>
    {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
    {children}
  </div>
);

export default DashboardCard;
import React from 'react';

export interface DLayoutCardProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

const LayoutCard: React.FC<DLayoutCardProps> = ({ title, children, className = "" }) => (
  <div 
    className={`border-2 rounded-[12px] p-6 shadow-sm min-h-[150px] ${className}`}
    style={{
      backgroundColor: 'var(--bg-card)',
      borderColor: 'var(--border-color)',
    }}
  >
    {title && <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h3>}
    {children}
  </div>
);

export default LayoutCard;
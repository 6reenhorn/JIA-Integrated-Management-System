import React from 'react';

export interface MainLayoutCardProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

const MainLayoutCard: React.FC<MainLayoutCardProps> = ({ title, children, className = "" }) => (
  <div className='border-2 border-[#E5E7EB] rounded-lg'>
    <div className={`bg-gray-100 py-6 rounded-lg  min-h-[150px] ${className}`}>
        {title && <h3 className="text-lg font-semibold mb-2 text-gray-800 px-6">{title}</h3>}
        <div className='h-[2px] bg-[#E5E7EB] w-full'></div>
        {children && <div className='px-6'>{children}</div>}
    </div>
  </div>
);

export default MainLayoutCard;
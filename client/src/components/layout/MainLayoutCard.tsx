import React from 'react';

export interface MainLayoutCardProps {
  sections?: { label: string; key: string }[];
  activeSection?: string;
  onSectionChange?: (key: string) => void;
  children?: React.ReactNode;
  className?: string;
}

const MainLayoutCard: React.FC<MainLayoutCardProps> = ({ sections, activeSection, onSectionChange, children, className = "" }) => (
  <div className='border-2 border-[#E5E7EB] rounded-[12px] min-h-[650px]'>
    <div className={`bg-gray-100 py-6 rounded-[12px] min-h-[150px] ${className}`}>
        {sections && sections.length > 0 ? (
          <div className="flex space-x-4 px-6 mb-2">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => onSectionChange?.(section.key)}
                className={`text-[14px] font-semibold px-3 py-1 rounded ${
                  activeSection === section.key
                    ? 'section-navigation-underline text-[#02367B]'
                    : 'text-[#6B7280] hover:bg-gray-200'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        ) : null}
        <div className='h-[2px] bg-[#E5E7EB] w-full'></div>
        {children && <div className='px-6'>{children}</div>}
    </div>
  </div>
);

export default MainLayoutCard;
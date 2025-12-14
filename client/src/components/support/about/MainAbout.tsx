import React from 'react';
import LayoutCard from '../../layout/LayoutCard';

const MainAbout: React.FC = () => {
  return (
    <section id="about-main" className="scroll-mt-20">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b-2 border-[#02367B]">
        About
      </h2>
      
      <div className="space-y-6 text-gray-700">
        <p className="text-sm leading-relaxed">
          JIA Integrated Management System (JIMS) is a comprehensive software solution designed to 
          digitalize and streamline business operations for JIA Business Center.
        </p>
        
        <LayoutCard>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Application Info</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li><strong>Version:</strong> 1.0.0</li>
            <li><strong>Release Date:</strong> December 2025</li>
            <li><strong>Support:</strong> Nobus Group</li>
            <li><strong>Documentation:</strong> Project Charter & Technical Specifications</li>
          </ul>
        </LayoutCard>
        
        <LayoutCard>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Key Features</h3>
          <ul className="space-y-2 text-gray-700 text-sm list-disc list-inside">
            <li>Inventory Management</li>
            <li>Point-of-Sale (POS) System</li>
            <li>Employee Attendance Monitoring</li>
            <li>E-Wallet Transaction Tracking</li>
            <li>Business Reporting & Analytics</li>
          </ul>
        </LayoutCard>
      </div>
    </section>
  );
};

export default MainAbout;
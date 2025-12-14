import React from 'react';
import LayoutCard from '../../layout/LayoutCard';

const VersionInfo: React.FC = () => (
  <section id="about-version" className="scroll-mt-20">
    <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b-2 border-[#02367B]">
      Version Info
    </h2>
    
    <div className="space-y-6 text-gray-700">
      <LayoutCard>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Current Version</h3>
        <p className="text-xl font-bold text-[#02367B]">v1.0.0</p>
      </LayoutCard>
      
      <LayoutCard>
        <h3 className="text-base font-semibold text-gray-900 mb-4">Build Details</h3>
        <ul className="space-y-2 text-gray-700 text-sm">
          <li><strong>Project Start:</strong> August 18, 2025</li>
          <li><strong>Projected End:</strong> December 17, 2025</li>
          <li><strong>Development Phase:</strong> August - December 2025</li>
          <li><strong>Technology Stack:</strong> React, TypeScript, Node.js</li>
        </ul>
      </LayoutCard>
      
      <LayoutCard>
        <h3 className="text-base font-semibold text-gray-900 mb-4">Release Notes</h3>
        <ul className="space-y-2 text-gray-700 text-sm list-disc list-inside">
          <li>Initial release of JIMS application</li>
          <li>Core modules: Inventory, POS, Attendance, E-Wallet Tracking</li>
          <li>Basic reporting and analytics features</li>
        </ul>
      </LayoutCard>
    </div>
  </section>
);

export default VersionInfo;
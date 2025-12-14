import React from 'react';

const VersionInfo: React.FC = () => (
  <section id="about-version" className="scroll-mt-20">
    <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#02367B]">
      Version Info
    </h2>
    
    <div className="space-y-6 text-gray-700">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Version</h3>
        <p className="text-2xl font-bold text-[#02367B]">v1.0.0</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Build Details</h3>
        <ul className="space-y-2 text-gray-700">
          <li><strong>Project Start:</strong> August 18, 2025</li>
          <li><strong>Projected End:</strong> December 17, 2025</li>
          <li><strong>Development Phase:</strong> August - December 2025</li>
          <li><strong>Technology Stack:</strong> React, TypeScript, Node.js</li>
        </ul>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Release Notes</h3>
        <ul className="space-y-2 text-gray-700 list-disc list-inside">
          <li>Initial release of JIMS application</li>
          <li>Core modules: Inventory, POS, Attendance, E-Wallet Tracking</li>
          <li>Basic reporting and analytics features</li>
        </ul>
      </div>
    </div>
  </section>
);

export default VersionInfo;
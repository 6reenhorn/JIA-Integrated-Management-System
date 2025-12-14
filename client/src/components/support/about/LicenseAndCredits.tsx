import React from 'react';
import LayoutCard from '../../layout/LayoutCard';

const LicenseAndCredits: React.FC = () => (
  <section id="about-license" className="scroll-mt-20">
    <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b-2 border-[#02367B]">
      License & Credits
    </h2>
    
    <div className="space-y-6 text-gray-700">
      <LayoutCard>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Software License</h3>
        <p className="text-sm">
          JIMS is developed as part of CS317 - Software Engineering course requirements 
          at the Department of Computer Science. All rights reserved.
        </p>
      </LayoutCard>
      
      <LayoutCard>
        <h3 className="text-base font-semibold text-gray-900 mb-4">Development Team Credits</h3>
        <ul className="space-y-2 text-sm list-disc list-inside">
          <li>Glenn Mark R. Anino - Full-Stack Developer / Lead QA</li>
          <li>Den Jester B. Antonio - Full-Stack Developer / QA</li>
          <li>John Jaybird L. Casia - UI/UX Designer / QA</li>
          <li>John Cyril G. Espina - Project Manager / Lead Full-Stack Developer</li>
          <li>Sophia Marie M. Flores - Front-End Developer / Lead UI/UX Designer</li>
          <li>Julien A. Marabe - UI/UX Designer / QA</li>
        </ul>
      </LayoutCard>
      
      <LayoutCard>
        <h3 className="text-base font-semibold text-gray-900 mb-4">Third-Party Acknowledgments</h3>
        <ul className="space-y-2 text-sm list-disc list-inside">
          <li>React.js - User interface library</li>
          <li>TypeScript - Programming language</li>
          <li>Tailwind CSS - Styling framework</li>
          <li>Other development tools and libraries</li>
        </ul>
      </LayoutCard>
      
      <div className="bg-gray-100 border-2 border-[#E5E7EB] rounded-[12px] p-6 shadow-sm text-center">
        <p className="text-sm text-gray-600">
          © 2025 JIA Integrated Management System (JIMS). CS317 Software Engineering Project.
        </p>
      </div>
    </div>
  </section>
);

export default LicenseAndCredits;
import React from 'react';

const LicenseAndCredits: React.FC = () => (
  <section id="about-license" className="scroll-mt-20">
    <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#02367B]">
      License & Credits
    </h2>
    
    <div className="space-y-6 text-gray-700">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Software License</h3>
        <p>
          JIMS is developed as part of CS317 - Software Engineering course requirements 
          at the Department of Computer Science. All rights reserved.
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Team Credits</h3>
        <ul className="space-y-2 list-disc list-inside">
          <li>Glenn Mark R. Anino - Full-Stack Developer / Lead QA</li>
          <li>Den Jester B. Antonio - Full-Stack Developer / QA</li>
          <li>John Jaybird L. Casia - UI/UX Designer / QA</li>
          <li>John Cyril G. Espina - Project Manager / Lead Full-Stack Developer</li>
          <li>Sophia Marie M. Flores - Front-End Developer / Lead UI/UX Designer</li>
          <li>Julien A. Marabe - UI/UX Designer / QA</li>
        </ul>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Third-Party Acknowledgments</h3>
        <ul className="space-y-2 list-disc list-inside">
          <li>React.js - User interface library</li>
          <li>TypeScript - Programming language</li>
          <li>Tailwind CSS - Styling framework</li>
          <li>Other development tools and libraries</li>
        </ul>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          © 2025 JIA Integrated Management System (JIMS). CS317 Software Engineering Project.
        </p>
      </div>
    </div>
  </section>
);

export default LicenseAndCredits;